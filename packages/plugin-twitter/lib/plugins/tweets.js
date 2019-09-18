import {chunk, tap} from "lodash/fp";
import {flowP, caughtP, flatmapP} from "dashp";
import {envelope as env, plugin as p} from "@sugarcube/core";

import {tweets, parseApiErrors} from "../twitter";
import {tweetTransform} from "../entities";
import {parseTweetId} from "../utils";
import {assertCredentials} from "../assertions";

const querySource = "twitter_tweet";

const tweetsPlugin = async (envelope, {log, cfg, stats}) => {
  const tweetIds = env
    .queriesByType(querySource, envelope)
    .map(term => parseTweetId(term));

  let counter = 0;

  log.info(`Querying Twitter for ${tweetIds.length} tweets.`);

  const fetchTweets = ids => {
    log.info(`Fetching a chunk of ${ids.length} tweets.`);
    stats.count("total", ids.length);

    return flowP(
      [
        // Fetch tweets for this chunk.
        tweets(cfg),
        // Log the download counter.
        tap(xs => {
          counter += Object.keys(xs).length;
          if (counter % 1000 === 0)
            log.debug(`Fetched ${counter} out of ${tweetIds.length} tweets.`);
        }),
        // Verify each tweet was retrieved and exists.
        ({id: response}) => {
          const results = [];
          const fails = [];
          // Verify the response and bail otherwise.
          if (response == null) {
            ids.forEach(id => {
              fails.push({
                type: querySource,
                term: id,
                plugin: "twitter_tweet",
                reason: "No tweets fetched.",
              });
            });
            return [results, fails];
          }

          Object.keys(response).forEach(id => {
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

          return [tweetTransform(results), fails];
        },
        // Handle any failed tweets.
        ([results, fails]) => {
          if (fails.length > 0) {
            fails.forEach(({term, reason}) =>
              stats.fail({
                type: querySource,
                plugin: "twitter_tweet",
                term,
                reason,
              }),
            );
          }
          return results;
        },
        // Merge the query into the data unit.
        results =>
          results.map(r => {
            const query = envelope.queries.find(
              ({type, term}) =>
                type === querySource && parseTweetId(term) === r.tweet_id,
            );
            if (query == null) return r;
            return Object.assign(r, {
              _sc_queries: Array.isArray(r._sc_queries)
                ? r._sc_queries.concat(query)
                : [query],
            });
          }),
        // Handle any API errors.
        caughtP(e => {
          const reason = parseApiErrors(e);
          ids.forEach(id => {
            stats.fail({
              type: querySource,
              term: id,
              plugin: "twitter_tweet",
              reason,
            });
          });
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
