import {property, size} from "lodash/fp";
import {flowP, collectP, spreadP, flatmapP} from "combinators-p";
import {envelope as env} from "@sugarcube/core";
import {unfold} from "@sugarcube/plugin-fs";

import {extract, entity} from "../utils";

const querySource = "glob_pattern";

const parseFiles = (envelope, {log}) => {
  const patterns = env.queriesByType(querySource, envelope);

  log.info(`Parsing ${size(patterns)} glob patterns.`);

  return flowP([
    flatmapP(unfold),
    collectP(unit =>
      flowP([property("location"), extract, spreadP(entity(unit))], unit)
    ),
    xs => env.concatData(xs, envelope),
  ])(patterns);
};

const plugin = parseFiles;

plugin.desc = "Parse files and extract the data and meta data";

export default plugin;
