import {curry, map, at, tail, head, zipObject, concat} from "lodash/fp";

// map sugarcube units to google spreadheet values
export const unitsToValues = curry((fields, units) => {
  const keys = concat(["_sc_id_hash"], fields);
  // TODO: test for types, only allow strings, ints, or bools. Recast to those
  // values. e.g 'TRUE' -> true
  return concat([keys], map(at(keys), units));
});

// map google spreadsheet values to sugarcube units
// TODO: only accept fields from a fieldlist
export const valuesToUnits = values => {
  // first row is keys
  const keys = head(values);
  return map(zipObject(keys), tail(values));
};

export default {unitsToValues, valuesToUnits};
