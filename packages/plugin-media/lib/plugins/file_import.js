import {join, basename, extname} from "path";
import {get} from "lodash/fp";
import dashp, {collectP} from "dashp";
import {envelope as env} from "@sugarcube/core";
import {
  mkdirP,
  sha256sum,
  md5sum,
  existsP,
  cpP,
  mvP,
  cleanUp,
} from "@sugarcube/plugin-fs";
import {counter} from "@sugarcube/utils";

import {ffmpeg} from "../utils";

const fileImportPlugin = async (envelope, {log, cfg, stats}) => {
  const dataDir = get("media.data_dir", cfg);
  const cmd = get("media.ffmpeg_cmd", cfg);
  const videoFormat = get("media.import_video_format", cfg);
  const parallel = get("media.import_parallel", cfg);
  const forceImport = get("media.force_import", cfg);
  const keepOriginal = get("media.keep_original", cfg);

  let mod;
  switch (parallel) {
    case parallel < 1 ? parallel : null:
      log.warn(
        `--media.import_parallel must be between 1 and 8. Setting to 1.`,
      );
      mod = "";
      break;
    case parallel === 1 ? parallel : null:
      log.info(`Run a single import at a time.`);
      mod = "";
      break;
    case parallel > 8 ? parallel : null:
      log.warn(
        `--media.import_parallel must be between 1 and 8. Setting to 8.`,
      );
      mod = 8;
      break;
    default:
      log.info(`Run ${parallel} imports concurrently.`);
      mod = parallel;
  }

  const mapper = dashp[`flatmapP${mod}`];
  const logCounter = counter(envelope.data.length, ({cnt, total, percent}) =>
    log.debug(`Progress: ${cnt}/${total} units (${percent}%).`),
  );

  const data = await mapper(async (unit) => {
    logCounter();

    const downloads = await collectP(async (media) => {
      const {type, term, href} = media;
      const source = href || term;
      const idHash = media._sc_id_hash;

      // Skip URL's from importing.
      if (/^https?:\/\//.test(source)) return null;

      stats.count("total");

      const dir = join(dataDir, unit._sc_id_hash, type);
      const filename =
        type === "video"
          ? `${idHash}.${videoFormat}`
          : `${idHash}${extname(source)}`;
      const origFilename = basename(source);
      const location = join(dir, filename);
      const origLocation = join(dir, origFilename);

      const importExists = await existsP(location);

      if (importExists && !forceImport) {
        log.info(`Media ${type} ${source} exists at ${location}. Skipping.`);
        stats.count("existing");

        return null;
      }

      if (importExists && forceImport)
        log.info(`Forcing a re-import of ${source}.`);

      await mkdirP(dir);

      try {
        // Videos are imported using ffmpeg, every other file is simply copied.
        if (type === "video") {
          await ffmpeg(cmd, source, `${location}.tmp.mp4`, forceImport);
          await mvP(`${location}.tmp.mp4`, location);
        } else {
          await cpP(source, `${location}.tmp`);
          await mvP(`${location}.tmp`, location);
        }
        // Import the original file as well.
        if (keepOriginal) {
          await cpP(source, `${origLocation}.tmp`);
          await mvP(`${origLocation}.tmp`, origLocation);
        }
      } catch (e) {
        const reason = `Failed to import ${media.type} to ${location}: ${e.message}.`;
        stats.fail({type: unit._sc_source, term: source, reason});
        await Promise.all([
          cleanUp(`${location}.tmp.mp4`),
          cleanUp(`${location}.tmp`),
          cleanUp(`${origLocation}.tmp`),
        ]);

        return null;
      }

      const [md5, sha256] = await Promise.all([
        md5sum(location),
        sha256sum(location),
      ]);

      log.info(`Imported ${source} to ${location}.`);
      if (keepOriginal) log.info(`Kept the original at ${origLocation}.`);
      stats.count("success");
      if (importExists) stats.count("new");

      return {
        location,
        md5,
        sha256,
        type,
        term,
        ...(href ? {href} : {}),
        ...(keepOriginal ? {original: origLocation} : {}),
      };
    }, unit._sc_media);

    return Object.assign(unit, {
      _sc_downloads: unit._sc_downloads.concat(
        downloads.filter((d) => d != null),
      ),
    });
  }, envelope.data);

  return env.envelope(data, envelope.queries);
};

fileImportPlugin.desc = "Import media files into the collection.";
fileImportPlugin.argv = {
  "media.data_dir": {
    type: "string",
    nargs: 1,
    default: "data",
    desc: "The path to the data collection directory.",
  },
  "media.import_video_format": {
    type: "string",
    nargs: 1,
    default: "mp4",
    desc: "The import format of the video.",
  },
  "media.ffmpeg_cmd": {
    type: "string",
    nargs: 1,
    default: "ffmpeg",
    desc: "The path to the ffmpeg command for video imports.",
  },
  "media.import_parallel": {
    type: "number",
    nargs: 1,
    desc: "Specify the number of parallel imports. Can be between 1 and 8.",
    default: 1,
  },
  "media.force_import": {
    type: "boolean",
    desc: "Force a re-import of the file.",
    default: false,
  },
  "media.keep_original": {
    type: "boolean",
    desc: "Keep a copy of the original file.",
    default: false,
  },
};

export default fileImportPlugin;
