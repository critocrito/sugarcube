import {size} from "lodash/fp";
import {flowP, tapP, caughtP} from "dashp";
import {envelope as env, plugin as p} from "@sugarcube/core";

import {feed, parseApiErrors} from "./twitter";
import {assertCredentials} from "./assertions";

const querySource = "twitter_user";

const feedPlugin = (envelope, {log, cfg, stats}) => {
  const users = env.queriesByType(querySource, envelope);

  log.debug(`Fetching the tweets for ${users.join(", ")}`);

  const fetchTimeline = user =>
    flowP(
      [
        feed(cfg),
        tapP(rs => log.info(`Fetched ${size(rs)} tweets for ${user}.`)),
        caughtP(e => {
          const reason = parseApiErrors(e);
          const fail = {
            type: querySource,
            term: user,
            plugin: "twitter_feed",
            reason,
          };
          stats.update(
            "failed",
            queries => (Array.isArray(queries) ? queries.concat(fail) : [fail]),
          );
          log.warn(`Failed to fetch ${user}: ${reason}`);
        }),
      ],
      user,
    );

  return env.flatMapQueriesAsync(fetchTimeline, querySource, envelope);
};

const plugin = p.liftManyA2([assertCredentials, feedPlugin]);

plugin.desc = "Fetch the tweets of an user.";
plugin.source = {
  name: querySource,
  desc: "A twitter user name",
};

plugin.argv = {
  "twitter.tweet_count": {
    default: 200,
    nargs: 1,
    desc: "Number of tweets retrived",
  },
  "twitter.retweets": {
    default: 1,
    nargs: 1,
    desc: "Include retweets",
  },
};

export default plugin;
