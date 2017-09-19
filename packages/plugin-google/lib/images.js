import {flow, map, flatten, get} from "lodash/fp";
import {envelope as env, utils} from "@sugarcube/core";

import {imageSearch, entity, imagesEntity} from "./google";

const {mapP} = utils.combinators;

const querySource = "google_search";

const plugin = (envelope, {log, cfg}) => {
  const queries = env.queriesByType(querySource, envelope);
  const headless = !get("google.headless", cfg);

  return mapP(searchTerm => {
    log.info(`Making an image search for ${searchTerm}.`);

    return imageSearch(3, headless, searchTerm).then(
      map(flow([entity(querySource), imagesEntity(searchTerm)]))
    );
  }, queries).then(xs => env.concatData(flatten(xs), envelope));
};

plugin.desc = "Conduct an image search on google.com.";

plugin.argv = {};

export default plugin;
