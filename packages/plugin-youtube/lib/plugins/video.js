import {size, get} from "lodash/fp";
import {flowP, tapP} from "dashp";
import {plugin as p, envelope as env} from "@sugarcube/core";
import {videosList} from "../api";
import {assertCredentials} from "../utils";

const querySource = "youtube_video";

const fetchVideos = (envelope, {cfg, log}) => {
  const key = get("youtube.api_key", cfg);
  const videos = env.queriesByType(querySource, envelope);

  return flowP(
    [
      videosList(key),
      tapP(units => log.info(`Fetched details for ${size(units)} videos.`)),
      units => env.concatData(units, envelope),
    ],
    videos,
  );
};

const plugin = p.liftManyA2([assertCredentials, fetchVideos]);

plugin.desc = "List details for individual videos.";
plugin.argv = {};

export default plugin;
