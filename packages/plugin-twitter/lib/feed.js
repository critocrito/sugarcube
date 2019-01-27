import {size} from "lodash/fp";
import {flowP, flatmapP, tapP, caughtP} from "dashp";
import {envelope as env, plugin as p} from "@sugarcube/core";

import {feed, parseApiErrors} from "./twitter";
import {parseTwitterUser} from "./utils";
import {assertCredentials} from "./assertions";

const querySource = "twitter_user";

const feedPlugin = async (envelope, {log, cfg, stats}) => {
  const users = env
    .queriesByType(querySource, envelope)
    .map(term => parseTwitterUser(term));

  log.debug(`Fetching the tweets for ${users.join(", ")}`);

  const fetchTimeline = user =>
    flowP(
      [
        feed(cfg),
        tapP(rs => log.info(`Fetched ${size(rs)} tweets for ${user}.`)),
        // Merge the query into the data unit.
        results =>
          results.map(r => {
            const query = envelope.queries.find(
              ({type, term}) =>
                type === querySource &&
                (parseTwitterUser(term) === r.user.screen_name ||
                  parseTwitterUser(term) === r.user.user_id),
            );
            if (query == null) return r;
            return Object.assign(r, {
              _sc_queries: Array.isArray(r._sc_queries)
                ? r._sc_queries.concat(query)
                : [query],
            });
          }),

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
          return [];
        }),
      ],
      user,
    );
  const results = await flatmapP(fetchTimeline, users);

  log.info(`Fetched ${results.length} tweets for ${users.length} users.`);

  return env.concatData(results, envelope);
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
