import {flow, map, flatten, get} from "lodash/fp";
import {envelope as env, utils} from "@sugarcube/core";

import {googleSearch, entity, searchEntity} from "./google";

const {mapP} = utils.combinators;

const querySource = "google_search";

const plugin = (envelope, {log, cfg}) => {
  const queries = env.queriesByType(querySource, envelope);
  const headless = !get("google.headless", cfg);

  return mapP(searchTerm => {
    log.info(`Making a search for ${searchTerm}.`);

    return googleSearch(headless, searchTerm).then(
      map(flow([entity(querySource), searchEntity(searchTerm)]))
    );
  }, queries).then(xs => env.concatData(flatten(xs), envelope));
};

plugin.desc = "Conduct a search on google.com.";

plugin.argv = {};

export default plugin;
