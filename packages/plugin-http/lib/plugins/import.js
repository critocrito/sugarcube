import fs from "fs";
import os from "os";
import path from "path";
import {promisify} from "util";
import {get} from "lodash/fp";
import dashp, {flowP} from "dashp";
import {envelope as env, crypto, createFeatureDecisions} from "@sugarcube/core";
import {counter, tikaToEntity} from "@sugarcube/utils";
import {mkdirP, cleanUp} from "@sugarcube/plugin-fs";

import {basicImport, hypercubeImport, urlContentType} from "../utils";
import browser from "../browser";

const mkdtemp = promisify(fs.mkdtemp);

const querySource = "http_url";

const plugin = async (envelope, {log, cfg, stats}) => {
  const parallel = get("http.import_parallel", cfg);

  const queries = env.queriesByType(querySource, envelope);

  let mod;
  switch (parallel) {
    case parallel < 1 ? parallel : null:
      log.warn(`--http.import_parallel must be between 1 and 8. Setting to 1.`);
      mod = "";
      break;
    case parallel === 1 ? parallel : null:
      log.info(`Run a single import at a time.`);
      mod = "";
      break;
    case parallel > 8 ? parallel : null:
      log.warn(`--http.import_parallel must be between 1 and 8. Setting to 8.`);
      mod = 8;
      break;
    default:
      log.info(`Run ${parallel} imports concurrently.`);
      mod = parallel;
  }

  const mapper = dashp[`flatmapP${mod}`];

  const {browse, dispose} = await browser();
  const tmpdir = await mkdtemp(path.join(os.tmpdir(), "sugarcube-"));
  await mkdirP(tmpdir);

  const logCounter = counter(envelope.data.length, ({cnt, total, percent}) =>
    log.debug(`Progress: ${cnt}/${total} units (${percent}%).`),
  );

  const decisions = createFeatureDecisions();

  const data = await flowP(
    [
      mapper(async url => {
        stats.count("total");

        let unit;
        let media = [];
        let mediaType;

        try {
          mediaType = await urlContentType(url);
        } catch (e) {
          stats.fail({type: "http_import", term: url, reason: e.message});
          return null;
        }

        try {
          if (mediaType === "url") {
            // Import URLS using the hypercube model. See the readme for a
            // link to referenced paper. Provide a location for a temporary
            // download.
            const target = path.join(tmpdir, `${crypto.uid(url)}.html`);
            [unit, media] = await hypercubeImport(browse, target, url);
          } else {
            // Images, videos and documents are imported using simply Apache Tika.
            unit = await basicImport(url);
            media.push({type: mediaType, term: url});
          }
        } catch (e) {
          stats.fail({type: "http_import", term: url, reason: e.message});
          return null;
        }

        if (unit == null) return null;

        log.info(`Imported url ${url} as media type "${mediaType}".`);
        stats.count("success");

        logCounter();

        // Test whether the new Ncube data format is enabled.
        if (decisions.canNcube())
          return {
            _sc_id: url,
            _sc_entity: "website",
            _sc_id_fields: ["_sc_id"],
            _sc_media: [{type: "url", term: url}].concat(media),
            _sc_queries: [{type: querySource, term: url}],
            _sc_href: url,
            ...tikaToEntity(unit),
            _sc_data: {
              location: url,
              // Fields that couldn't be extracted are not added to the unit.
              ...Object.keys(unit).reduce((memo, key) => {
                if (unit[key] == null) return memo;
                return Object.assign(memo, {[key]: unit[key]});
              }, {}),
            },
          };

        // Use the old data forma.
        return {
          _sc_id_fields: ["location"],
          _sc_media: [{type: "url", term: url}].concat(media),
          _sc_queries: [{type: querySource, term: url}],
          _sc_href: url,
          ...tikaToEntity(unit),
          location: url,
          // Fields that couldn't be extracted are not added to the unit.
          ...Object.keys(unit).reduce((memo, key) => {
            if (unit[key] == null) return memo;
            return Object.assign(memo, {[key]: unit[key]});
          }, {}),
        };
      }),
      async rs => {
        if (tmpdir != null) await cleanUp(tmpdir);
        if (dispose != null) await dispose();
        return rs.filter(r => r !== null);
      },
    ],
    queries,
  );

  return env.concatData(data, envelope);
};

plugin.argv = {
  "http.import_parallel": {
    type: "number",
    nargs: 1,
    desc: "The number of parallel HTTP imports. Can be between 1 and 8.",
    default: 1,
  },
};
plugin.desc = "Import HTTP URI's as Sugarcube units.";

export default plugin;
