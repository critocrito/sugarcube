import {join} from "path";
import {includes, get} from "lodash/fp";
import dashp, {flowP, tapP, collectP} from "dashp";
import {PuppeteerWARCGenerator, PuppeteerCapturer} from "node-warc";
import {envelope as env} from "@sugarcube/core";
import {
  mkdirP,
  sha256sum,
  md5sum,
  existsP,
  mvP,
  cleanUp,
} from "@sugarcube/plugin-fs";
import {counter} from "@sugarcube/utils";

import browser from "../browser";

const archiveTypes = ["url"];

const plugin = async (envelope, {log, cfg, stats}) => {
  const dataDir = get("media.data_dir", cfg);
  const forceArchive = get("media.warc_force_archive", cfg);
  const parallel = get("media.warc_parallel", cfg);

  let mod;
  switch (parallel) {
    case parallel < 1 ? parallel : null:
      log.warn(`--media.warc_parallel must be between 1 and 8. Setting to 1.`);
      mod = "";
      break;
    case parallel === 1 ? parallel : null:
      log.info(`Run a single archival at a time.`);
      mod = "";
      break;
    case parallel > 8 ? parallel : null:
      log.warn(`--media.warc_parallel must be between 1 and 8. Setting to 8.`);
      mod = 8;
      break;
    default:
      log.info(`Run ${parallel} archivals concurrently.`);
      mod = parallel;
  }

  const mapper = dashp[`flatmapP${mod}`];
  const {browse, dispose} = await browser();
  const logCounter = counter(envelope.data.length, ({cnt, total, percent}) =>
    log.debug(`Progress: ${cnt}/${total} units (${percent}%).`),
  );

  const data = await flowP(
    [
      mapper(async unit => {
        const medias = await collectP(async media => {
          const {type, term, href} = media;
          const source = href || term;
          const idHash = media._sc_id_hash;

          if (!includes(type, archiveTypes)) return media;

          stats.count("total");

          const warcDir = join(dataDir, unit._sc_id_hash, "warc");
          const location = join(warcDir, `${idHash}.warc.gz`);
          const archiveExists = await existsP(location);

          if (archiveExists && !forceArchive) {
            log.info(`Archive ${source} exists at ${location}. Skipping.`);
            stats.count("existing");
            return media;
          }

          if (archiveExists && forceArchive) {
            log.info(`Re-archiving ${source}.`);
            stats.count("re-archive");
          }

          try {
            await browse(async ({goto, page}) => {
              const cap = new PuppeteerCapturer(page);
              cap.startCapturing();

              await goto(source);

              // ensure the download directory.
              await mkdirP(warcDir);

              const warcGen = new PuppeteerWARCGenerator({gzip: true});
              await warcGen.generateWARC(cap, {
                warcOpts: {warcPath: `${location}.tmp.warc.gz`},
                winfo: {
                  description: `${source} captured as part of: ${cfg.name}`,
                  isPartOf: cfg.project,
                },
              });
            });
            await mvP(`${location}.tmp.warc.gz`, location);
          } catch (e) {
            const reason = `Failed to archive url: ${e.message}`;
            stats.fail({type: unit._sc_source, term: source, reason});
            await cleanUp(`${location}.tmp.warc.gz`);

            return media;
          }

          log.info(`Archived ${source} to ${location}.`);
          stats.count("success");
          if (!archiveExists) stats.count("new");

          const [md5, sha256] = await Promise.all([
            md5sum(location),
            sha256sum(location),
          ]);
          unit._sc_downloads.push(
            Object.assign(
              {},
              {
                location,
                md5,
                sha256,
                type,
                term,
              },
              href ? {href} : {},
            ),
          );

          return media;
        }, unit._sc_media);

        logCounter();

        return Object.assign({}, unit, {_sc_media: medias});
      }),
      tapP(() => dispose()),
    ],
    envelope.data,
  );

  return env.envelope(data, envelope.queries);
};

plugin.argv = {
  "media.data_dir": {
    type: "string",
    nargs: 1,
    default: "data",
    desc: "The path to the download directory.",
  },
  "media.warc_force_archive": {
    type: "boolean",
    desc: "Force a re-archiving of the URL.",
    default: false,
  },
  "media.warc_parallel": {
    type: "number",
    nargs: 1,
    desc: "The number of parallel website archivals. Can be between 1 and 8.",
    default: 1,
  },
};
plugin.desc = "Archive websites in using the WARC format.";

export default plugin;
