import {join} from "path";
import {includes, get} from "lodash/fp";
import {flowP, tapP, flatmapP, collectP} from "dashp";
import {PuppeteerWARCGenerator, PuppeteerCapturer} from "node-warc";
import {envelope as env} from "@sugarcube/core";
import {mkdirP, sha256sum, md5sum, existsP} from "@sugarcube/plugin-fs";
import {counter} from "@sugarcube/utils";

import {cleanUp} from "../utils";
import browser from "../browser";

const archiveTypes = ["url"];

const plugin = async (envelope, {log, cfg, stats}) => {
  const dataDir = get("media.data_dir", cfg);
  const forceArchive = get("media.warc_force_archive", cfg);

  // const browser = await puppeteer.launch();
  const {browse, dispose} = await browser();
  const logCounter = counter(envelope.data.length, ({cnt, total, percent}) =>
    log.debug(`Progress: ${cnt}/${total} units (${percent}%).`),
  );

  const data = await flowP(
    [
      flatmapP(async unit => {
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
            log.info(
              `Archive ${source} exists at ${location}. Not re-archiving.`,
            );
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
                warcOpts: {warcPath: location},
                winfo: {
                  description: `${source} captured as part of: ${cfg.name}`,
                  isPartOf: cfg.project,
                },
              });
            });
          } catch (e) {
            const reason = `Failed to archive url: ${e.message}`;
            stats.fail({type: unit._sc_source, term: source, reason});

            // If we force an archive and it fails, but exists already, better to
            // keep the old one around.
            if (archiveExists && !forceArchive) await cleanUp(location);

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
};
plugin.desc = "Archive websites in using the WARC format.";

export default plugin;
