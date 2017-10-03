import {flow, map, concat, merge, get} from "lodash/fp";
import Promise from "bluebird";
import parse from "csv-parse";
import fs from "fs";
import {envelope as env, data as d, plugin as p, utils} from "@sugarcube/core";

import {assertIdFields} from "../assertions";

const {unfold} = utils.fs;
const {reduceP} = utils.combinators;

const querySource = "glob_pattern";

const importPlugin = (envelope, {log, cfg}) => {
  const patterns = env.queriesByType(querySource, envelope);
  const delimiter = get("csv.delimiter", cfg);
  // FIXME: Split the string as part of the command parsing coercion
  const idFields = get("csv.id_fields", cfg).split(",");

  const entity = merge(d.emptyOne(), {
    _sc_id_fields: idFields,
  });

  return reduceP(
    (memo, pattern) =>
      unfold(pattern).then(
        flow([
          // The order of the merge matters, otherwise the id_fields are merged
          // ssbadly.
          map(u => merge(u, entity)),
          concat(memo),
        ])
      ),
    [],
    patterns
  )
    .reduce((memo, unit) => {
      const records = [];
      const parser = parse({delimiter, columns: true});
      const input = fs.createReadStream(unit.location);

      // eslint-disable-next-line promise/avoid-new
      return new Promise((resolve, reject) => {
        parser.on("error", reject);
        parser.on("finish", () => {
          log.info(`Finished parsing ${unit.location}`);
          resolve(records);
        });
        parser.on("readable", () => {
          let record;
          // eslint-disable-next-line no-cond-assign
          while ((record = parser.read())) {
            records.push(merge(unit, record));
          }
        });
        input.pipe(parser);
      }).then(concat(memo));
    }, [])
    .then(xs => env.concatData(xs, envelope));
};

const plugin = p.liftManyA2([assertIdFields, importPlugin]);

plugin.desc = "Import data from csv files.";

plugin.argv = {
  "csv.id_fields": {
    nargs: 1,
    desc: "Specify the id fields separated by a comma.",
    coerce: arg => arg.split(","),
  },
};

export default plugin;
