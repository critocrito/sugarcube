import {map, merge, get} from "lodash/fp";
import {flow as flowP, flatmap} from "combinators-p";
import {envelope as env, data as d, plugin as p} from "@sugarcube/core";
import {unfold} from "@sugarcube/plugin-fs";

import {parseMany} from "../parse";
import {assertIdFields} from "../assertions";

const querySource = "glob_pattern";

const importPlugin = (envelope, {cfg}) => {
  const patterns = env.queriesByType(querySource, envelope);
  const delimiter = get("csv.delimiter", cfg);
  // FIXME: Split the string as part of the command parsing coercion
  const idFields = get("csv.id_fields", cfg).split(",");

  const entity = merge(d.emptyOne(), {
    _sc_id_fields: idFields,
  });

  return flowP(
    [
      flatmap(pattern =>
        // The order of the merge matters, otherwise the id_fields are merged badly.
        unfold(pattern).then(map(u => merge(u, entity)))
      ),
      parseMany(delimiter),
      xs => env.concatData(xs, envelope),
    ],
    patterns
  );
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
