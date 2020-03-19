import {get, chunk, flow, reduce, compact} from "lodash/fp";
import {flatmapP} from "dashp";
import {envelope as env, plugin as p} from "@sugarcube/core";
import {counter} from "@sugarcube/utils";

import {tweets, parseApiErrors} from "../twitter";
import {parseTweetId} from "../utils";
import {assertCredentials} from "../assertions";

const getAll = (fields, obj) => {
  let result;
  for (const field of fields) {
    if (result == null) result = get(field, obj);
  }
  return result;
};

const plugin = async (envelope, {log, cfg, stats}) => {
  const logCounter = counter(
    envelope.data.length,
    ({cnt, total, percent}) =>
      log.debug(`Progress: ${cnt}/${total} units (${percent}%).`),
    {threshold: 500, steps: 500},
  );

  log.info(`Checking ${envelope.data.length} tweets.`);

  const twitterTweets = await flatmapP(async units => {
    stats.count("total", units.length);

    const ids = flow([
      reduce((memo, unit) => {
        const id = getAll(["_sc_id", "tweet_id"], unit);
        if (id == null) {
          stats.fail({
            type: "twitter_tweet",
            term: unit._sc_id_hash,
            reason: `Twitter id is invalid (_sc_id: ${get(
              "_sc_id",
              unit,
            )}, tweet_id: ${get("tweet_id", unit)})`,
          });
          return memo;
        }
        try {
          return memo.concat(parseTweetId(id));
        } catch (e) {
          console.log(unit);
          log.error(`Failed to parse twitter id of unit ${unit._sc_id_hash}.`);
          stats.fail({
            type: "twitter_tweet",
            term: unit._sc_id_hash,
            reason: e.message,
          });
          return memo;
        }
      }, []),
      compact,
    ])(units);

    const missing = [];

    try {
      const {id: response} = await tweets(cfg, ids);
      if (response == null) {
        ids.forEach(id => {
          stats.fail({
            type: "twitter_tweet",
            term: id,
            reason: "No tweets fetched.",
          });
        });
        return [];
      }

      Object.keys(response).forEach(id => {
        logCounter();

        if (response[id] == null) {
          const unit = units.find(({tweet_id: tweetId}) => tweetId === id);
          stats.fail({
            type: "twitter_tweet",
            term: id,
            reason: "Tweet does not exist.",
          });
          missing.push(unit);
        } else {
          stats.count("success");
        }
      });
    } catch (e) {
      const reason = parseApiErrors(e);
      ids.forEach(id => stats.fail({type: "twitter_tweet", term: id, reason}));
    }

    return missing;
  }, chunk(50, envelope.data.filter(({_sc_source: source}) => source === "twitter_tweets" || source === "twitter_feed")));

  stats.count("existing", envelope.data.length - twitterTweets.length);
  stats.count("missing", twitterTweets.length);
  log.info(
    `Fetch details for ${envelope.data.length} Tweets: ${twitterTweets.length} failed.`,
  );

  return env.envelopeData(twitterTweets);
};

const twitterFilterFailingPlugin = p.liftManyA2([assertCredentials, plugin]);

twitterFilterFailingPlugin.desc =
  "Check failing tweets and remove existing tweets from the pipeline.";
twitterFilterFailingPlugin.argv = {};

export default twitterFilterFailingPlugin;
