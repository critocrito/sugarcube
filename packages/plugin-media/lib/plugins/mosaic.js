import {get} from "lodash/fp";
import dashp, {collectP} from "dashp";
import pify from "pify";
import {join, resolve, dirname} from "path";
import fs from "fs";
import {envelope as env} from "@sugarcube/core";

import {mosaicSceneChange, mosaicNthFrame} from "../utils";

const accessAsync = pify(fs.access);

const plugin = async (envelope, {log, cfg, stats}) => {
  const cmd = get("media.ffmpeg_cmd", cfg);
  const parallel = get("media.youtubedl_parallel", cfg);
  const forceGeneration = get("media.mosaic_force", cfg);
  const strategy = get("media.mosaic_strategy", cfg);

  let mod;
  switch (parallel) {
    case parallel < 1 ? parallel : null:
      log.warn(
        `--media.mosaic_parallel must be between 1 and 8. Setting to 1.`,
      );
      mod = "";
      break;
    case parallel === 1 ? parallel : null:
      log.info(`Run a single download at a time.`);
      mod = "";
      break;
    case parallel > 8 ? parallel : null:
      log.warn(
        `--media.mosaic_parallel must be between 1 and 8. Setting to 8.`,
      );
      mod = 8;
      break;
    default:
      log.info(`Run ${parallel} downloads concurrently.`);
      mod = parallel;
  }

  const mapper = dashp[`flatmapP${mod}`];
  let counter = 0;

  const data = await mapper(async unit => {
    const downloads = await collectP(async download => {
      const {type, term, href, location} = download;

      if (type !== "video") return download;

      const source = href || term;
      const dest = join(dirname(location), "mosaic.jpg");

      try {
        await accessAsync(location);
      } catch (e) {
        const failed = {
          type: unit._sc_source,
          term: source,
          plugin: "media_mosaic",
          reason:
            e.code === "ENOENT"
              ? `Video at ${location} doesn't exits`
              : e.message,
        };
        stats.update(
          "failed",
          fails => (Array.isArray(fails) ? fails.concat(failed) : [failed]),
        );
        if (e.code !== "ENOENT") {
          throw e;
        }
        log.warn(`Video at ${location} doesn't exist. Skipping mosaic.`);
        return download;
      }

      let mosaicExists = false;

      try {
        await accessAsync(resolve(dest));
        mosaicExists = true;
      } catch (e) {
        if (e.code !== "ENOENT") {
          throw e;
        }
      }

      if (mosaicExists && !forceGeneration) {
        log.info(
          `Mosaic of ${location} exists at ${dest}. Not forcing a re-generation.`,
        );
        return Object.assign({}, download, {mosaic: dest});
      }

      if (mosaicExists && forceGeneration)
        log.info(`Forcing a mosaic re-generation of ${location}.`);

      const mosaicGeneration =
        strategy === "nth-frame" ? mosaicNthFrame : mosaicSceneChange;

      try {
        await mosaicGeneration(cmd, location, resolve(dest), forceGeneration);
      } catch (ee) {
        const failed = {
          type: unit._sc_source,
          term: source,
          plugin: "media_mosaic",
          reason: ee.message,
        };
        stats.update(
          "failed",
          fails => (Array.isArray(fails) ? fails.concat(failed) : [failed]),
        );

        log.warn(
          `Failed to create mosaic for video at ${location}: ${ee.message}`,
        );

        return download;
      }

      log.info(`Created mosaic at ${dest} with strategy ${strategy}.`);

      counter += 1;
      if (counter % 100 === 0)
        log.debug(
          `Generated ${counter} mosaics out of ${envelope.data.length} units.`,
        );

      return Object.assign({}, download, {mosaic: dest});
    }, unit._sc_downloads);

    return Object.assign({}, unit, {_sc_downloads: downloads});
  }, envelope.data);

  return env.envelope(data, envelope.queries);
};

plugin.argv = {
  "media.ffmpeg_cmd": {
    type: "string",
    nargs: 1,
    default: "ffmpeg",
    desc: "The path to the ffmpeg command.",
  },
  "media.mosaic_parallel": {
    type: "number",
    nargs: 1,
    desc: "The number of parallel mosaic generations. Can be between 1 and 8.",
    default: 1,
  },
  "media.mosaic_force": {
    type: "boolean",
    desc: "Force a re-generation of the mosaic.",
    default: false,
  },
  "media.mosaic_strategy": {
    type: "string",
    nargs: 1,
    desc: "Choose the strategy for mosaic generation.",
    choices: ["scene-change", "nth-frame"],
    default: "scene-change",
  },
};

plugin.desc = "Create a mosaic of screenshots video.";

export default plugin;
