import {get, chunk} from "lodash/fp";
import {flatmapP, flowP, delayP} from "dashp";
import {envelope as env, plugin as p} from "@sugarcube/core";
import {counter} from "@sugarcube/utils";

import {videosList} from "../api";
import {assertCredentials, parseYoutubeVideo} from "../utils";

const querySource = "youtube_video";

const fetchVideos = async (envelope, {cfg, log, stats}) => {
  const key = get("youtube.api_key", cfg);

  const queries = env
    .queriesByType(querySource, envelope)
    .map(term => parseYoutubeVideo(term));

  const logCounter = counter(
    envelope.data.length,
    ({cnt, total, percent}) =>
      log.debug(`Progress: ${cnt}/${total} units (${percent}%).`),
    {threshold: 50, steps: 25},
  );

  log.info(`Querying for ${queries.length} videos.`);

  const videos = await flatmapP(
    flowP([
      async qs => {
        stats.count("total", qs.length);
        log.info(`Fetch details for ${qs.length} videos.`);

        let results = [];
        let failMsg = "Doesn't exist";

        try {
          results = await videosList(key, qs);
          stats.count("success", results.length);
        } catch (e) {
          failMsg = e.message;
        }

        if (results.length !== qs.length) {
          const missing = qs.reduce(
            (memo, q) =>
              results.find(({id}) => id === q) == null
                ? memo.concat({
                    type: querySource,
                    term: q,
                    reason: failMsg,
                  })
                : memo,
            [],
          );
          missing.forEach(stats.fail);
        }
        qs.forEach(logCounter);

        // Merge the query into the data unit.
        return results.map(r => {
          const query = envelope.queries.find(
            ({type, term}) =>
              type === querySource && parseYoutubeVideo(term) === r.id,
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
