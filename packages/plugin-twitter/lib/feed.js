import {size} from "lodash/fp";
import {envelope as env, plugin as p} from "@sugarcube/core";

import {feed} from "./twitter";
import {assertCredentials} from "./assertions";

const querySource = "twitter_user";

const feedPlugin = (envelope, {log, cfg}) => {
  const users = env.queriesByType(querySource, envelope);

  log.debug(`Fetching the tweets for ${users.join(", ")}`);

  return feed(cfg, log, users)
    .tap(rs => log.info(`Fetched ${size(rs)} tweets for all queries.`))
    .then(rs => env.concatData(rs, envelope));
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
