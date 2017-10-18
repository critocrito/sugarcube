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
} from "lodash/fp";

const requiredFields = ["_sc_id_hash", "_sc_content_hash"];

// map sugarcube units to google spreadheet values
export const unitsToValues = curry((fields, units) => {
  const keys = uniq(concat(requiredFields, fields));
  // TODO: test for types, only allow strings, ints, or bools. Recast to those
  // values. e.g 'TRUE' -> true
  return concat([keys], map(at(keys), units));
});

// map google spreadsheet values to sugarcube units
export const valuesToUnits = curry((fields, values) => {
  const keys = uniq(concat(requiredFields, fields));
  console.log(fields, keys);
  return flow([map(zipObject(head(values))), map(pick(keys))])(tail(values));
});

export default {unitsToValues, valuesToUnits};
