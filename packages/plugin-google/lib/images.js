import {flow, get} from "lodash/fp";
import {flowP, collectP, flatmapP, mapP, tapP} from "combinators-p";
import {envelope as env} from "@sugarcube/core";

import {imageSearch, entity, imagesEntity} from "./google";

const querySource = "google_search";

const plugin = (envelope, {log, cfg}) => {
  const queries = env.queriesByType(querySource, envelope);
  const headless = !get("google.headless", cfg);

  const search = term =>
    flowP(
      [
        tapP(() => log.info(`Making an image search for ${term}.`)),
        imageSearch(3, headless),
        collectP(flow([entity(querySource), imagesEntity(term)])),
      ],
      term
    );

  return flowP(
    [flatmapP(search), mapP(rs => env.concatData(rs, envelope))],
    queries
  );
};

plugin.desc = "Conduct an image search on google.com.";

plugin.argv = {};

export default plugin;
