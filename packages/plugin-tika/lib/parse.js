import {flow, map, merge, concat, size} from "lodash/fp";
import {envelope as env, data as d, plugin as p, utils} from "@sugarcube/core";

import {extract, entity} from "./utils";

const {unfold} = utils.fs;
const {reduceP} = utils.combinators;

const querySource = "glob_pattern";

const parseFiles = (envelope, {log}) => {
  const patterns = env.queriesByType(querySource, envelope);

  log.info(`Parsing ${size(patterns)} glob patterns.`);

  return reduceP(
    (memo, pattern) =>
      unfold(pattern).then(flow([map(merge(d.emptyOne())), concat(memo)])),
    [],
    patterns
  )
    .map(f => extract(f.location).then(([text, meta]) => entity(f, text, meta)))
    .then(xs => env.concatData(xs, envelope));
};

const plugin = p.liftManyA2([parseFiles]);

plugin.desc = "Parse files and extract the data and meta data";

export default plugin;
