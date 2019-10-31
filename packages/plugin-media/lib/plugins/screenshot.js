import {join} from "path";
import {merge, includes, get} from "lodash/fp";
import {flowP, tapP, collectP} from "dashp";
import {envelope as env} from "@sugarcube/core";
import {mkdirP, sha256sum, md5sum, existsP} from "@sugarcube/plugin-fs";
import {counter} from "@sugarcube/utils";

import {cleanUp} from "../utils";
import browser from "../browser";

const archiveTypes = ["url"];

const plugin = async (envelope, {log, cfg, stats}) => {
  const dataDir = get("media.data_dir", cfg);
  const force = get("media.force", cfg);

  const {browse, dispose} = await browser();

  const logCounter = counter(envelope.data.length, ({cnt, total, percent}) =>
    log.debug(`Progress: ${cnt}/${total} units (${percent}%).`),
  );

  return flowP(
    [
      env.fmapDataAsync(async unit => {
        const medias = await collectP(async media => {
          const {type, term, href} = media;
          const source = href || term;
          const idHash = media._sc_id_hash;

          if (!includes(type, archiveTypes)) return media;

          stats.count("total");

          const dir = join(dataDir, unit._sc_id_hash, "image");
          const location = join(dir, `screenshot-${idHash}.jpg`);
          const screenshotExists = await existsP(location);

          if (screenshotExists && !force) {
            log.info(`Screenshot ${source} exists at ${location}. Skipping.`);
            stats.count("existing");
            return media;
          }

          if (screenshotExists && force) {
            log.info(`Forcing a new screenshot for ${source}.`);
            stats.count("forced");
          }

          try {
            await browse(async ({goto, page}) => {
              await goto(source);
              await mkdirP(dir);
              await page.screenshot({
                path: location,
                quality: 100,
                fullPage: true,
              });
            });
          } catch (e) {
            const reason = `Failed to take screenshot: ${e.message}`;
            stats.fail({type: unit._sc_source, term: source, reason});

            // If we force an archive and it fails, but exists already, better to
            // keep the old one around.
            if (screenshotExists && !force) await cleanUp(location);

            return media;
          }

          log.info(`Taking a screenshot of ${source} in ${location}.`);
          stats.count("success");
          if (!screenshotExists) stats.count("new");

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

        return merge(unit, {_sc_media: medias});
      }),
      tapP(() => dispose()),
    ],
    envelope,
  );
};

plugin.argv = {
  "media.data_dir": {
    type: "string",
    nargs: 1,
    default: "data",
    desc: "The path to the download directory.",
  },
  "media.force": {
    type: "boolean",
    desc: "Force to take a screenshot of the URL.",
    default: false,
  },
};
plugin.desc = "Take a screenshot of a media URL.";

export default plugin;
