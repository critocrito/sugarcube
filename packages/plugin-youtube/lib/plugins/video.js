import {get, chunk} from "lodash/fp";
import {collectP, flowP, tapP, delayP} from "dashp";
import {envelope as env, plugin as p} from "@sugarcube/core";
import {videosList} from "../api";
import {assertCredentials, parseVideoQuery} from "../utils";

const querySource = "youtube_video";

const fetchVideos = async (envelope, {cfg, log}) => {
  const key = get("youtube.api_key", cfg);

  const queries = env
    .queriesByType(querySource, envelope)
    .map(term => parseVideoQuery(term));

  log.info(`Querying for ${queries.length} videos.`);

  const videos = await collectP(
    flowP([
      tapP(chunks => log.info(`Fetch details for ${chunks.length} videos.`)),
      videosList(key),
      delayP(1000),
    ]),
    chunk(50, queries),
  );

  return env.concatData(videos, envelope);
};

const plugin = p.liftManyA2([assertCredentials, fetchVideos]);

plugin.desc = "List details for individual videos.";
plugin.argv = {};

export default plugin;
