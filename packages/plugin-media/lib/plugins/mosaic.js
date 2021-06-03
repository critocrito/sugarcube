import {get} from "lodash/fp";
import dashp, {collectP} from "dashp";
import {join, dirname} from "path";
import {envelope as env} from "@sugarcube/core";
import {existsP, mvP, cleanUp} from "@sugarcube/plugin-fs";
import {counter} from "@sugarcube/utils";

import {mosaicSceneChange, mosaicNthFrame} from "../utils";

const plugin = async (envelope, {log, cfg, stats}) => {
  const cmd = get("media.ffmpeg_cmd", cfg);
  const parallel = get("media.mosaic_parallel", cfg);
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
      log.info(`Run a single mosaic generation at a time.`);
      mod = "";
      break;
    case parallel > 8 ? parallel : null:
      log.warn(
        `--media.mosaic_parallel must be between 1 and 8. Setting to 8.`,
      );
      mod = 8;
      break;
    default:
      log.info(`Run ${parallel} generations concurrently.`);
      mod = parallel;
  }

  const mapper = dashp[`flatmapP${mod}`];
  const logCounter = counter(envelope.data.length, ({cnt, total, percent}) =>
    log.debug(`Progress: ${cnt}/${total} units (${percent}%).`),
  );

  const data = await mapper(async (unit) => {
    const downloads = await collectP(async (download) => {
      const {type, term, href, location} = download;

      if (type !== "video") return download;
      if (location == null || location === "") {
        log.warn(`No location for video ${term}. Skipping mosaic creation.`);
        return download;
      }

      const source = href || term;
      const idHash = download._sc_id_hash;

      // Make sure the video really exists before attempting to generate a
      // mosaic.
      if (!(await existsP(location))) {
        const reason = `Source video at ${location} doesn't exist. Skipping`;
        stats.fail({type: unit._sc_source, term: source, reason});

        return download;
      }

      // Maintain compatibility with the old mosaic path.
      const newDest = join(dirname(location), `${idHash}.mosaic.jpg`);
      const oldDest = join(dirname(location), "mosaic.jpg");

      let dest = newDest;
      let mosaicExists = false;

      try {
        const destinations = [newDest, oldDest];
        const destExists = await Promise.all(
          destinations.map((d) => existsP(d)),
        );

        for (let i = 0; i < destExists.length; i += 1) {
          if (destExists[i]) {
            mosaicExists = true;
            dest = destinations[i];
          }
        }
      } catch (e) {
        const reason = `Failed to access ${e.path}: ${e.message}.`;
        stats.fail({type: unit._sc_source, term: source, reason});
        return null;
      }

      if (mosaicExists && !forceGeneration) {
        log.info(`Mosaic of ${location} exists at ${dest}. Skipping`);
        stats.count("existing");

        return {...download, mosaic: dest};
      }

      if (mosaicExists && forceGeneration)
        log.info(`Forcing a mosaic re-generation of ${location}.`);

      const mosaicGeneration =
        strategy === "nth-frame" ? mosaicNthFrame : mosaicSceneChange;

      try {
        await mosaicGeneration(
          cmd,
          location,
          `${dest}.tmp.jpg`,
          forceGeneration,
        );
        // The mosaic generation doesn't always yield an image. If the file
        // doesn't exist ignore the move.
        if (await existsP(`${dest}.tmp.jpg`))
          await mvP(`${dest}.tmp.jpg`, dest);
      } catch (e) {
        const reason = `Failed to create mosaic for video at ${location}: ${e.message}`;
        stats.fail({type: unit._sc_source, term: source, reason});
        await cleanUp(`${dest}.tmp.jpg`);

        return download;
      }

      log.info(`Created mosaic at ${dest} with strategy ${strategy}.`);
      stats.count("success");
      if (!mosaicExists) stats.count("new");

      return {...download, mosaic: dest};
    }, unit._sc_downloads);

    logCounter();

    return {...unit, _sc_downloads: downloads};
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
