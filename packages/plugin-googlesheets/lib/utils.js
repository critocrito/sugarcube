import {get, concat, map, each, merge, set, curry} from "lodash/fp";

// TODO: remove procedural code from this file

const eachW = each.convert({
  // Specify capping iteratee arguments.
  cap: false,
});

// map sugarcube units to google spreadheet values
export const unitsToValues = (units, fieldsList) => {
  // get list of fields to export
  const fields = concat(
    // default fields
    ["_sc_id_hash"],
    fieldsList || []
  );

  const bigData = map(u =>
    map(k => {
      // console.log(k, u);
      // TODO: test for types, only allow strings, ints, or bools
      // recast to those values. e.g 'TRUE' -> true
      const kk = k; // just cause we want more than one line function for now
      return get(kk)(u);
    })(fields)
  )(units);

  bigData.unshift(fields); // first row is keys

  return bigData;
};

// map google spreadsheet values to sugarcube units
// TODO: only accept fields from a fieldlist
export const valuesToUnits = curry(values => {
  const keys = values.shift(); // first row is keys
  const units = map(u => {
    let newu = {};
    eachW((k, i) => {
      newu = merge(newu, set(k, u[i])(newu));
    })(keys);
    return newu;
  })(values);
  return units;
});

export default {unitsToValues, valuesToUnits};
