import {map, merge, get} from "lodash/fp";
import {flowP, flatmapP, tapP} from "dashp";
import {envelope as env, data as d, plugin as p} from "@sugarcube/core";
import {unfold} from "@sugarcube/plugin-fs";

import {parseMany} from "../parse";
import {assertIdFields} from "../assertions";

const querySource = "glob_pattern";

const importPlugin = (envelope, {cfg, log}) => {
  const patterns = env.queriesByType(querySource, envelope);
  const delimiter = get("csv.delimiter", cfg);
  // FIXME: Split the string as part of the command parsing coercion
  const idFields = get("csv.id_fields", cfg).split(",");

  const entity = merge(d.emptyOne(), {
    _sc_id_fields: idFields,
  });

  return flowP(
    [
      // The order of the merge matters, otherwise the id_fields are merged badly.
      flatmapP(pattern => unfold(pattern).then(map(u => merge(u, entity)))),
      tapP(fs => log.info(`Parsing data from ${fs.length} files.`)),
      parseMany(delimiter),
      tapP(xs => log.info(`Parsed ${xs.length} units.`)),
      xs => env.concatData(xs, envelope),
    ],
    patterns
  );
};

const plugin = p.liftManyA2([assertIdFields, importPlugin]);

plugin.desc = "Import data from csv files.";

export default plugin;
