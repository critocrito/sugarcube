import {chunk} from "lodash/fp";
import {flowP, caughtP, flatmapP} from "dashp";
import {
  envelope as env,
  plugin as p,
  createFeatureDecisions,
} from "@sugarcube/core";
import {counter} from "@sugarcube/utils";

import {tweets, parseApiErrors} from "../twitter";
import {tweetNcube, tweetLegacy} from "../entities";
import {parseTweetId} from "../utils";
import {assertCredentials} from "../assertions";

const querySource = "twitter_tweet";

const tweetsPlugin = async (envelope, {log, cfg, stats}) => {
  const decisions = createFeatureDecisions();

  const tweetIds = env
    .queriesByType(querySource, envelope)
    .map((term) => parseTweetId(term));

  const logCounter = counter(
    envelope.data.length,
    ({cnt, total, percent}) =>
      log.debug(`Progress: ${cnt}/${total} units (${percent}%).`),
    {threshold: 50, steps: 25},
  );

  log.info(`Querying Twitter for ${tweetIds.length} tweets.`);

  const fetchTweets = (ids) => {
    log.info(`Fetching a chunk of ${ids.length} tweets.`);
    stats.count("total", ids.length);

    return flowP(
      [
        // Fetch tweets for this chunk.
        tweets(cfg),
        // Verify each tweet was retrieved and exists.
        ({id: response}) => {
          const results = [];
          const fails = [];
          // Verify the response and bail otherwise.
          if (response == null) {
            ids.forEach((id) => {
              fails.push({
                type: querySource,
                term: id,
                plugin: "twitter_tweet",
                reason: "No tweets fetched.",
              });
            });
            return [results, fails];
          }

          Object.keys(response).forEach((id) => {
            logCounter();
            if (response[id] == null) {
              fails.push({
                type: querySource,
                term: id,
                plugin: "twitter_tweet",
                reason: "Tweet does not exist.",
              });
            } else {
              stats.count("success");
              results.push(response[id]);
            }
          });

          const op = decisions.canNcube() ? tweetNcube : tweetLegacy;

          return [results.map(op), fails];
        },
        // Handle any failed tweets.
        ([results, fails]) => {
          if (fails.length > 0) {
            fails.forEach(({term, reason}) =>
              stats.fail({type: querySource, term, reason}),
            );
          }
          return results;
        },
        // Merge the query into the data unit.
        (results) =>
          results.map((r) => {
            const q = envelope.queries.find(({type, term}) => {
              const tweetId = decisions.canNcube() ? r._sc_id : r.tweet_id;
              return type === querySource && parseTweetId(term) === tweetId;
            });

            if (q == null) return r;

            const {tags, ...query} = q;

            return Object.assign(
              r,
              {
                _sc_queries: Array.isArray(r._sc_queries)
                  ? r._sc_queries.concat(query)
                  : [query],
              },
              Array.isArray(tags) && tags.length > 0
                ? {
                    _sc_tags: Array.isArray(r._sc_tags)
                      ? r._sc_tags.concat(tags)
                      : tags,
                  }
                : undefined,
            );
          }),
        // Handle any API errors.
        caughtP((e) => {
          const reason = parseApiErrors(e);
          ids.forEach((id) =>
            stats.fail({type: querySource, term: id, reason}),
          );
          return [];
        }),
      ],
      ids,
    );
  };

  const results = await flatmapP(fetchTweets, chunk(50, tweetIds));

  log.info(`Fetched ${results.length} out of ${tweetIds.length} tweets.`);

  return env.concatData(results, envelope);
};

const plugin = p.liftManyA2([assertCredentials, tweetsPlugin]);

plugin.desc = "Fetch individual tweets";
plugin.argv = {};

export default plugin;
