import {get} from "lodash/fp";
import {flatmapP, collectP} from "dashp";
import {envelope as env} from "@sugarcube/core";
import {extract, tikaMetaFields, tikaToEntity} from "@sugarcube/utils";

import {unfold, mimeCategory} from "../api";

const querySource = "glob_pattern";

const plugin = async (envelope, {cfg, log, stats}) => {
  const language = get("fs.extract_language", cfg);

  const queries = env.queriesByType(querySource, envelope);

  const data = await flatmapP(async query => {
    const files = await unfold(query);

    if (files.length === 0) {
      log.warn(`Glob pattern ${query} failed to expand to any files.`);
      return [];
    }

    log.info(`Expanding glob pattern ${query} to ${files.length} files.`);

    return collectP(async unit => {
      const {location} = unit;
      const category = mimeCategory(location);

      let contents = {text: null, meta: {}};
      try {
        contents = await extract(location, {language});
      } catch (e) {
        if (!/unsupported media type/i.test(e.message)) {
          stats.fail({
            type: "fs_import",
            term: location,
            reason: e.message,
          });
        }
      }
      const {text, meta} = contents;

      const unitData = {
        body: text == null || text === "" ? null : text.trim(),
        ...tikaMetaFields(meta),
      };

      log.info(`Imported file at ${location}.`);
      stats.count("total");
      stats.count("success");

      return Object.assign({}, unit, {
        _sc_queries: [{type: querySource, term: query}],
        _sc_media: [{type: category, term: location}],
        _sc_href: location,
        ...tikaToEntity(unit),
        // Fields that couldn't be extracted are not added to the unit.
        ...Object.keys(unitData).reduce((memo, key) => {
          if (unitData[key] == null) return memo;
          return Object.assign(memo, {[key]: unitData[key]});
        }, {}),
      });
    }, files);
  }, queries);

  return env.concatData(data.filter(unit => unit != null), envelope);
};

plugin.argv = {
  "fs.extract_language": {
    type: "string",
    nargs: 1,
    default: "eng",
    desc: "A ISO 839-2 3 letter language code to set the extraction language.",
  },
};
plugin.desc = "Import files from a glob pattern.";

export default plugin;
