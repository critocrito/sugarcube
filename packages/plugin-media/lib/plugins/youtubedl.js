import {merge, includes, get} from "lodash/fp";
import {flowP, collectP, tapP} from "dashp";
import pify from "pify";
import {join} from "path";
import fs from "fs";
import {envelope as env} from "@sugarcube/core";
import {mkdirP, sha256sum, md5sum} from "@sugarcube/plugin-fs";

import {youtubeDl} from "../utils";

const accessAsync = pify(fs.access);

const downloadTypes = ["video"];

const plugin = (envelope, {cfg, log}) => {
  const dataDir = get("media.data_dir", cfg);
  const cmd = get("media.youtubedl_cmd", cfg);
  const videoFormat = get("media.download_format", cfg);
  const debug = get("media.youtubedl_debug", cfg);

  // ensure the download directory.
  return flowP(
    [
      mkdirP,
      () =>
        env.fmapDataAsync(
          unit =>
            collectP(media => {
              const {type, term} = media;
              const idHash = media._sc_id_hash;

              if (!includes(type, downloadTypes)) {
                return media;
              }
              const location = join(
                dataDir,
                unit._sc_id_hash,
                "youtubedl",
                `${idHash}.${videoFormat}`
              );

              // Download all videos.
              return accessAsync(location) // eslint-disable-line promise/no-nesting
                .then(() => log.info(`Video ${term} exists at ${location}.`))
                .catch(e => {
                  if (e.code === "ENOENT") {
                    return flowP(
                      [
                        youtubeDl(debug, cmd, videoFormat, term),
                        tapP(() =>
                          log.info(`Downloaded ${term} to ${location}.`)
                        ),
                      ],
                      location
                    );
                  }
                  throw e;
                })
                .then(() =>
                  Promise.all([md5sum(location), sha256sum(location)])
                )
                .then(([md5, sha256]) =>
                  unit._sc_downloads.push({location, md5, sha256, type, term})
                )
                .catch(() =>
                  log.warn(`Failed to download video ${term} to ${location}`)
                )
                .then(() => media);
            }, unit._sc_media).then(ms => merge(unit, {_sc_media: ms})),
          envelope
        ),
    ],
    dataDir
  );
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
};

export default plugin;
