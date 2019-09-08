import fs from "fs";
import {join, extname} from "path";
import {get} from "lodash/fp";
import dashp, {collectP} from "dashp";
import {promisify} from "util";
import {envelope as env} from "@sugarcube/core";
import {mkdirP, sha256sum, md5sum} from "@sugarcube/plugin-fs";

import {ffmpeg} from "../utils";

const cpP = promisify(fs.copyFile);
const accessP = promisify(fs.access);
const unlinkP = promisify(fs.unlink);

const cleanUp = async location => {
  try {
    await accessP(location);
    await unlinkP(location);
    // eslint-disable-next-line no-empty
  } catch (e) {}
};

const fileImportPlugin = async (envelope, {log, cfg, stats}) => {
  const dataDir = get("media.data_dir", cfg);
  const cmd = get("media.ffmpeg_cmd", cfg);
  const videoFormat = get("media.import_video_format", cfg);
  const parallel = get("media.import_parallel", cfg);
  const forceImport = get("media.force_import", cfg);

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
  let counter = 0;

  const data = await mapper(async unit => {
    const downloads = await collectP(async media => {
      const {type, term, href} = media;
      const source = href || term;
      const idHash = media._sc_id_hash;

      // Skip URL's from importing.
      if (/^https?:\/\//.test(source)) return null;

      const dir = join(dataDir, unit._sc_id_hash, type);
      const filename =
        type === "video"
          ? `${idHash}.${videoFormat}`
          : `${idHash}${extname(source)}`;
      const location = join(dir, filename);

      let importExists = false;

      try {
        await accessP(location);
        importExists = true;
      } catch (e) {
        if (e.code !== "ENOENT") {
          throw e;
        }
      }

      if (importExists && !forceImport) {
        log.info(
          `Media ${type} ${source} exists at ${location}. Not forcing an import.`,
        );
        return null;
      }

      if (importExists && forceImport)
        log.info(`Forcing a re-import of ${source}.`);

      // Only if we have a video and hasn't the right video format already, we use ffmpeg.
      const op =
        type === "video" && !new RegExp(`${videoFormat}$`).test(extname(source))
          ? (s, d, f = false) => ffmpeg(cmd, s, d, f)
          : (s, d) => cpP(s, d);

      await mkdirP(dir);

      let sha256;
      let md5;

      try {
        await op(source, location, forceImport);
        [md5, sha256] = await Promise.all([
          md5sum(location),
          sha256sum(location),
        ]);
      } catch (e) {
        stats.fail({
          type: unit._sc_source,
          term: source,
          plugin: "media_file_import",
          reason: e.message,
        });
        log.warn(
          `Failed to download ${media.type} ${source} to ${location}. Cleaning up stale artifact.`,
        );

        // If we force an import and it fails, but the import exists already,
        // better to keep the old one around.
        if (importExists && !forceImport) await cleanUp(location);

        return null;
      }

      log.info(`Imported ${source} to ${location}.`);

      counter += 1;
      if (counter % 100 === 0)
        log.debug(`Imported ${counter} out of ${envelope.data.length} units.`);

      return Object.assign(
        {},
        {
          location,
          md5,
          sha256,
          type,
          term,
        },
        href ? {href} : {},
      );
    }, unit._sc_media);

    return Object.assign(unit, {
      _sc_downloads: unit._sc_downloads.concat(
        downloads.filter(d => d != null),
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
};

export default fileImportPlugin;
