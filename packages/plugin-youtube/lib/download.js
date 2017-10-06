import {merge, includes, size, filter, get} from "lodash/fp";
import Promise from "bluebird";
import {join} from "path";
import fs from "fs";
import {envelope as env, plugin as p, utils} from "@sugarcube/core";

import {Counter, assertCredentials, youtubeDl} from "./utils";

Promise.promisifyAll(fs);
const {mkdirP, sha256sum, md5sum} = utils.fs;

const downloadTypes = ["youtube_video"];

const downloadVideo = (envelope, {cfg, log}) => {
  const {dir, cmd} = get("youtube", cfg);
  const videoFormat = get("youtube.download_format", cfg);

  const counter = new Counter(
    size(filter(u => u._sc_source === "youtube_channel", envelope.data))
  );

  // ensure the download directory.
  return mkdirP(dir).then(() =>
    env.fmapDataDownloadsAsync(d => {
      const {type, term, videoId, _sc_id_hash} = d;
      if (!includes(type, downloadTypes)) {
        return d;
      }
      const location = join(
        dir,
        type,
        _sc_id_hash,
        `${videoId}.${videoFormat}`
      );
      // Download all videos.
      return fs
        .accessAsync(location) // eslint-disable-line promise/no-nesting
        .then(() =>
          log.info(
            `Video ${videoId} exists at ${location}. (${counter.count()}/${counter.total})`
          )
        )
        .catch(e => {
          if (e.code === "ENOENT") {
            return youtubeDl(cmd, videoFormat, term, location).tap(() =>
              log.info(
                `Downloaded ${videoId} to ${location}. (${counter.count()}/${counter.total})`
              )
            );
          }
          throw e;
        })
        .then(() => Promise.all([md5sum(location), sha256sum(location)]))
        .spread((md5, sha256) => merge(d, {location, md5, sha256}))
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
