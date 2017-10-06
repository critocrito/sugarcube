import {size} from "lodash/fp";
import {envelope as env, plugin as p} from "@sugarcube/core";
import {search} from "./twitter";

import {assertCredentials} from "./assertions";

const querySource = "twitter_query";

const searchPlugin = (envelope, {log, cfg}) => {
  const queries = env.queriesByType(querySource, envelope);

  log.debug(`Searching for ${queries.join(", ")}.`);

  return search(cfg, log, queries)
    .tap(rs => log.info(`Fetched ${size(rs)} search results.`))
    .then(rs => env.concatData(rs, envelope));
};

const plugin = p.liftManyA2([assertCredentials, searchPlugin]);

plugin.desc = "Search the Twitter API for a search term or hashtag.";
plugin.source = {
  name: querySource,
  desc: "A search term",
};

export default plugin;
