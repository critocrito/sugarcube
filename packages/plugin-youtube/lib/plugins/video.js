import {get} from "lodash/fp";
import {flowP, tapP} from "dashp";
import {plugin as p, envelope as env} from "@sugarcube/core";
import {videosList} from "../api";
import {assertCredentials, parseVideoQuery} from "../utils";

const querySource = "youtube_video";

const fetchVideos = (envelope, {cfg, log}) => {
  const key = get("youtube.api_key", cfg);

  const scrapeVideo = flowP([
    parseVideoQuery,
    tapP(query => log.info(`Fetch details for ${query}.`)),
    videosList(key),
  ]);

  return env.flatMapQueriesAsync(scrapeVideo, querySource, envelope);
};

const plugin = p.liftManyA2([assertCredentials, fetchVideos]);

plugin.desc = "List details for individual videos.";
plugin.argv = {};

export default plugin;
