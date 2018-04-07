import {envelope as env, plugin as p} from "@sugarcube/core";

import {followers} from "./twitter";
import {assertCredentials} from "./assertions";

const querySource = "twitter_user";

const followersPlugin = (envelope, {log, cfg}) => {
  const users = env.queriesByType(querySource, envelope);

  log.debug(
    [
      `Fetching followers of ${users.join(", ")}`,
      `${cfg.twitter.recurse_depth} levels deep.`,
    ].join(" "),
  );

  return followers(cfg, log, users).then(rs => env.concatData(rs, envelope));
};

const plugin = p.liftManyA2([assertCredentials, followersPlugin]);

plugin.desc = "Fetch the followers of a Twitter user.";
plugin.source = {
  name: querySource,
  desc: "A twitter user name",
};

export default plugin;
