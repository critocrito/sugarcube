import {merge, includes, get} from "lodash/fp";
import dashp, {flowP, collectP, tapP} from "dashp";
import pify from "pify";
import {join} from "path";
import fs from "fs";
import {envelope as env} from "@sugarcube/core";
import {mkdirP, sha256sum, md5sum} from "@sugarcube/plugin-fs";

import {youtubeDl} from "../utils";

const accessAsync = pify(fs.access);

const downloadTypes = ["video"];

const plugin = async (envelope, {cfg, log}) => {
  const dataDir = get("media.data_dir", cfg);
  const cmd = get("media.youtubedl_cmd", cfg);
  const videoFormat = get("media.download_format", cfg);
  const debug = get("media.youtubedl_debug", cfg);
  const parallel = get("media.youtubedl_parallel", cfg);

  let mod;
  switch (parallel) {
    case parallel < 1 ? parallel : null:
      log.warn(
        `--media.youtubedl_parallel must be between 1 and 8. Setting to 1.`,
      );
      mod = "";
      break;
    case parallel === 1 ? parallel : null:
      log.info(`Run a single download at a time.`);
      mod = "";
      break;
    case parallel > 8 ? parallel : null:
      log.warn(
        `--media.youtubedl_parallel must be between 1 and 8. Setting to 8.`,
      );
      mod = 8;
      break;
    default:
      log.info(`Run ${parallel} downloads concurrently.`);
      mod = parallel;
  }

  const mapper = dashp[`flatmapP${mod}`];

  // ensure the download directory.
  await mkdirP(dataDir);
  const data = await mapper(
    unit =>
      // Avoid live broadcasts, otherwise youtubedl gets "stuck".
      unit.snippet != null && unit.snippet.liveBroadcastContent === "live"
        ? unit
        : collectP(media => {
            const {type, term, href} = media;
            const source = href || term;
            const idHash = media._sc_id_hash;

            if (!includes(type, downloadTypes)) return media;

            const location = join(
              dataDir,
              unit._sc_id_hash,
              "youtubedl",
              `${idHash}.${videoFormat}`,
            );

            // Download all videos.
            return accessAsync(location) // eslint-disable-line promise/no-nesting
              .then(() => log.info(`Video ${source} exists at ${location}.`))
              .catch(e => {
                if (e.code === "ENOENT") {
                  return flowP(
                    [
                      youtubeDl(debug, cmd, videoFormat, source),
                      tapP(() =>
                        log.info(`Downloaded ${source} to ${location}.`),
                      ),
                    ],
                    location,
                  );
                }
                throw e;
              })
              .then(() => Promise.all([md5sum(location), sha256sum(location)]))
              .then(([md5, sha256]) =>
                unit._sc_downloads.push(
                  Object.assign(
                    {},
                    {
                      location,
                      md5,
                      sha256,
                      type,
                      term,
                      href,
                    },
                    href ? {href} : {},
                  ),
                ),
              )
              .catch(() =>
                log.warn(`Failed to download video ${source} to ${location}`),
              )
              .then(() => media);
          }, unit._sc_media).then(ms => merge(unit, {_sc_media: ms})),
    envelope.data,
  );

  return env.envelope(data, envelope.queries);
};

plugin.desc = "Download videos using youtube-dl.";

plugin.argv = {
  "media.data_dir": {
    type: "string",
    nargs: 1,
    default: "data",
    desc: "The path to the download directory.",
  },
  "media.download_format": {
    type: "string",
    nargs: 1,
    default: "mp4",
    desc: "The download format of the video.",
  },
  "media.youtubedl_cmd": {
    type: "string",
    nargs: 1,
    default: "youtube-dl",
    desc: "The path to the youtube-dl command.",
  },
  "media.youtubedl_debug": {
    type: "boolean",
    desc: "Log the youtube-dl output and debug symbols to the console.",
  },
  "media.youtubedl_parallel": {
    type: "number",
    nargs: 1,
    desc:
      "Specify the number of parallel youtubedl downloads. Can be between 1 and 8.",
    default: 1,
  },
};

export default plugin;
