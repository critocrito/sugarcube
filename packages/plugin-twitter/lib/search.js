import {size} from "lodash/fp";
import {flowP, tapP} from "dashp";
import {envelope as env, plugin as p} from "@sugarcube/core";
import {search} from "./twitter";

import {assertCredentials} from "./assertions";

const querySource = "twitter_query";

const searchPlugin = (envelope, {log, cfg}) => {
  const queries = env.queriesByType(querySource, envelope);

  log.debug(`Searching for ${queries.join(", ")}.`);

  return flowP(
    [
      search(cfg, log),
      tapP(rs => log.info(`Fetched ${size(rs)} search results.`)),
      rs => env.concatData(rs, envelope),
    ],
    queries,
  );
};

const plugin = p.liftManyA2([assertCredentials, searchPlugin]);

plugin.desc = "Search the Twitter API for a search term or hashtag.";
plugin.argv = {
  "twitter.language": {
    type: "string",
    nargs: 1,
    desc: "Limit tweets to a languag, specified as language code, e.g. pt.",
  },
  "twitter.geocode": {
    type: "string",
    nargs: 1,
    desc:
      "Limit tweets located within a given radius of the given geo" +
      " location, e.g. 37.781157 -122.398720 1km",
  },
};
plugin.source = {
  name: querySource,
  desc: "A search term",
};

export default plugin;
