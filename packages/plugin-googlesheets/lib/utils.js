import {
  curry,
  flow,
  map,
  pick,
  at,
  tail,
  head,
  zipObject,
  concat,
  uniq,
  toLower,
} from "lodash/fp";

const requiredFields = ["_sc_id_hash", "_sc_content_hash"];
const queryFields = ["type", "term"];

const keys = flow([concat(requiredFields), uniq]);
const header = flow([head, map(toLower)]);
const zipValues = curry((fields, values) =>
  flow([map(zipObject(header(values))), map(pick(fields))])(tail(values))
);

// Map SugarCube units to google spreadheet values.
export const unitsToValues = curry((fields, units) =>
  concat([keys(fields)], map(at(keys(fields)), units))
);

// Map google spreadsheet values to SugarCube units.
export const valuesToUnits = curry((fields, values) =>
  zipValues(keys(fields), values)
);

// Map google spreadsheet values to SugarCube queries.
export const valuesToQueries = zipValues(queryFields);

export default {unitsToValues, valuesToUnits, valuesToQueries};
