import {merge, includes, size, filter, get} from "lodash/fp";
import {flowP, tapP} from "dashp";
import pify from "pify";
import {join} from "path";
import fs from "fs";
import {envelope as env, plugin as p} from "@sugarcube/core";
import {mkdirP, sha256sum, md5sum} from "@sugarcube/plugin-fs";

import {Counter, assertCredentials, youtubeDl} from "./utils";

const accessAsync = pify(fs.access);

const downloadTypes = ["youtube_video"];

const downloadVideo = (envelope, {cfg, log}) => {
  const {download_dir, cmd} = get("youtube", cfg);
  const videoFormat = get("youtube.download_format", cfg);

  const counter = new Counter(
    size(filter(u => u._sc_source === "youtube_channel", envelope.data))
  );

  // ensure the download directory.
  return mkdirP(download_dir).then(() =>
    env.fmapDataDownloadsAsync(d => {
      const {type, term, videoId, _sc_id_hash} = d;
      if (!includes(type, downloadTypes)) {
        return d;
      }
      const location = join(
        download_dir,
        type,
        _sc_id_hash,
        `${videoId}.${videoFormat}`
      );

      // Download all videos.
      return accessAsync(location) // eslint-disable-line promise/no-nesting
        .then(() =>
          log.info(
            `Video ${videoId} exists at ${location}. (${counter.count()}/${counter.total})`
          )
        )
        .catch(e => {
          if (e.code === "ENOENT") {
            return flowP(
              [
                youtubeDl(cmd, videoFormat, term),
                tapP(() =>
                  log.info(
                    `Downloaded ${videoId} to ${location}. (${counter.count()}/${counter.total})`
                  )
                ),
              ],
              location
            );
          }
          throw e;
        })
        .then(() => Promise.all([md5sum(location), sha256sum(location)]))
        .then(([md5, sha256]) => merge(d, {location, md5, sha256}))
        .catch(() => {
          log.error(`Failed to download video ${videoId} to ${location}`);
          return merge(d, {failed: true});
        });
    }, envelope)
  );
};

const plugin = p.liftManyA2([assertCredentials, downloadVideo]);

plugin.desc = "Download videos from youtube using youtube-dl.";

plugin.argv = {
  "youtube.download_dir": {
    type: "string",
    nargs: 1,
    default: "downloads",
    desc: "The path to the download directory.",
  },
  "youtube.download_format": {
    type: "string",
    nargs: 1,
    default: "mp4",
    desc: "The download format of the video.",
  },
  "youtube.cmd": {
    type: "string",
    nargs: 1,
    default: "youtube-dl",
    desc: "The path to the youtube-dl command.",
  },
};

export default plugin;
