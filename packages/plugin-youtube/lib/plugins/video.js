import {get, chunk} from "lodash/fp";
import {flatmapP, flowP, tapP, delayP} from "dashp";
import {envelope as env, plugin as p} from "@sugarcube/core";
import {videosList} from "../api";
import {assertCredentials, parseVideoQuery} from "../utils";

const querySource = "youtube_video";

const fetchVideos = async (envelope, {cfg, log, stats}) => {
  const key = get("youtube.api_key", cfg);

  const queries = env
    .queriesByType(querySource, envelope)
    .map(term => parseVideoQuery(term));

  log.info(`Querying for ${queries.length} videos.`);

  const videos = await flatmapP(
    flowP([
      tapP(chunks => log.info(`Fetch details for ${chunks.length} videos.`)),
      async qs => {
        const results = await videosList(key, qs);
        if (results.length !== qs.length) {
          const missing = qs.reduce(
            (memo, q) =>
              results.find(({id}) => id === q) == null
                ? memo.concat({
                    type: querySource,
                    term: q,
                    plugin: "youtube_video",
                    reason: "Youtube video does not exist.",
                  })
                : memo,
            [],
          );
          stats.update(
            "failed",
            fails => (Array.isArray(fails) ? fails.concat(missing) : missing),
          );
          missing.forEach(({term}) =>
            log.warn(`Video ${term} does not exist.`),
          );
        }
        // Merge the query into the data unit.
        return results.map(r => {
          const query = envelope.queries.find(
            ({type, term}) =>
              type === querySource && parseVideoQuery(term) === r.id,
          );
          if (query == null) return r;
          return Object.assign(r, {
            _sc_queries: Array.isArray(r._sc_queries)
              ? r._sc_queries.concat(query)
              : [query],
          });
        });
      },
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
