import {merge, size, get} from "lodash/fp";
import {flowP, collectP, flatmapP, mapP, tapP} from "combinators-p";
import {envelope as env} from "@sugarcube/core";
import {unfold} from "@sugarcube/plugin-fs";
import path from "path";

import {reverseImageSearchFromFile, entity} from "./google";

const querySource = "glob_pattern";

const plugin = (envelope, {log, cfg}) => {
  const queries = env.queriesByType(querySource, envelope);
  const headless = !get("google.headless", cfg);

  const search = term =>
    flowP(
      [
        unfold,
        tapP(rs => log.info(`Searching for ${size(rs)} files in ${term}.`)),
        collectP(unit =>
          flowP([
            reverseImageSearchFromFile(headless, path.resolve(unit.location)),
            merge(unit),
            entity("google_reverse_image"),
          ])()
        ),
      ],
      term
    );

  return flowP(
    [flatmapP(search), mapP(rs => env.concatData(rs, envelope))],
    queries
  );
};

plugin.desc = "Make a Google reverse image search.";

plugin.argv = {};

export default plugin;
