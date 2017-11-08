import {flow, get} from "lodash/fp";
import {flowP, flatmapP, collectP, tapP} from "dashp";
import {envelope as env} from "@sugarcube/core";

import {googleSearch, entity, searchEntity} from "./google";

const querySource = "google_search";

const plugin = (envelope, {log, cfg}) => {
  const queries = env.queriesByType(querySource, envelope);
  const headless = !get("google.headless", cfg);

  const search = term =>
    flowP(
      [
        tapP(() => log.info(`Making a search for ${term}.`)),
        googleSearch(headless),
        collectP(flow([entity(querySource), searchEntity(term)])),
      ],
      term
    );

  return flowP([flatmapP(search), rs => env.concatData(rs, envelope)], queries);
};

plugin.desc = "Conduct a search on google.com.";

plugin.argv = {};

export default plugin;
