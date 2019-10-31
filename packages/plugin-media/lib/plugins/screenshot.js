import {join} from "path";
import {merge, includes, get} from "lodash/fp";
import dashp, {collectP} from "dashp";
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
  const force = get("media.force", cfg);
  const parallel = get("media.parallel", cfg);

  let mod;
  switch (parallel) {
    case parallel < 1 ? parallel : null:
      log.warn(`--media.parallel must be between 1 and 8. Setting to 1.`);
      mod = "";
      break;
    case parallel === 1 ? parallel : null:
      log.info(`Take a single screenshot at a time.`);
      mod = "";
      break;
    case parallel > 8 ? parallel : null:
      log.warn(`--media.parallel must be between 1 and 8. Setting to 8.`);
      mod = 8;
      break;
    default:
      log.info(`Take ${parallel} screenshots concurrently.`);
      mod = parallel;
  }

  const mapper = dashp[`flatmapP${mod}`];
  const {browse, dispose} = await browser();

  const logCounter = counter(envelope.data.length, ({cnt, total, percent}) =>
    log.debug(`Progress: ${cnt}/${total} units (${percent}%).`),
  );

  const data = await mapper(async unit => {
    const medias = await collectP(async media => {
      const {type, term, href} = media;
      const source = href || term;
      const idHash = media._sc_id_hash;

      if (!includes(type, archiveTypes)) return media;

      stats.count("total");

      const dir = join(dataDir, unit._sc_id_hash, "image");
      const location = join(dir, `${idHash}.screenshot.jpg`);
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
            path: `${location}.tmp.jpg`,
            quality: 100,
            fullPage: true,
          });
        });
        await mvP(`${location}.tmp.jpg`, location);
      } catch (e) {
        const reason = `Failed to take screenshot: ${e.message}`;
        stats.fail({type: unit._sc_source, term: source, reason});
        await cleanUp(`${location}.tmp.jpg`);

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
            term,
            type: "image",
          },
          href ? {href} : {},
        ),
      );

      return media;
    }, unit._sc_media);

    logCounter();

    return merge(unit, {_sc_media: medias});
  }, envelope.data);

  await dispose();

  return env.envelope(data, envelope.queries);
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
  "media.parallel": {
    type: "number",
    nargs: 1,
    desc: "The number of parallel website screenshots. Can be between 1 and 8.",
    default: 1,
  },
};
plugin.desc = "Take a screenshot of a media URL.";

export default plugin;
