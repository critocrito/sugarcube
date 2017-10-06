import {envelope as env, plugin as p} from "@sugarcube/core";

import {friends} from "./twitter";
import {assertCredentials} from "./assertions";

const querySource = "twitter_user";

const friendsPlugin = (envelope, {log, cfg}) => {
  const users = env.queriesByType(querySource, envelope);

  log.debug(
    [
      `Fetching friends of ${users.join(", ")}`,
      `${cfg.twitter.recurse_depth} levels deep.`,
    ].join(" ")
  );

  return friends(cfg, log, users).then(rs => env.concatData(rs, envelope));
};

const plugin = p.liftManyA2([assertCredentials, friendsPlugin]);

plugin.desc = "Fetch the friends of a Twitter user.";
plugin.source = {
  name: querySource,
  desc: "A twitter user name",
};

export default plugin;
