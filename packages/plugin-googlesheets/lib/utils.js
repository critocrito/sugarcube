import {
  curry,
  flow,
  map,
  reject,
  pick,
  at,
  tail,
  head,
  zipObjectDeep,
  concat,
  uniq,
  toLower,
  isEmpty,
} from "lodash/fp";
import {envelope as env} from "@sugarcube/core";

const requiredFields = ["_sc_id_hash", "_sc_content_hash"];
const queryFields = ["type", "term"];

export const header = flow([head, map(toLower)]);

const fixBools = map(v => {
  switch (v) {
    case "TRUE":
      return true;
    case "FALSE":
      return false;
    default:
      return v;
  }
});

const keys = flow([concat(requiredFields), uniq]);
const zipRows = curry((fields, rows) =>
  flow([
    tail, // The body of the spreadsheet, without the header.
    reject(isEmpty), // Drop empty rows.
    map(fixBools),
    map(zipObjectDeep(header(rows))), // Create a list of objects.
    map(pick(fields)), // Only select the wanted fields.
  ])(rows),
);

// Map SugarCube units to google spreadheet rows.
export const unitsToRows = curry((fields, units) =>
  concat([keys(fields)], map(at(keys(fields)), units)),
);

// Map google spreadsheet rows to SugarCube units.
export const rowsToUnits = curry((fields, rows) => zipRows(keys(fields), rows));

// Map google spreadsheet rows to SugarCube queries.
export const rowsToQueries = zipRows(queryFields);

export const concatEnvelopeAndRows = curry(({data}, rows) => {
  const units = rowsToUnits(header(rows), rows);
  return env.concat(env.envelopeData(data), env.envelopeData(units));
});

export const concatRows = curry((rowsA, rowsB) => {
  const unitsA = rowsToUnits(header(rowsA), rowsA);
  const unitsB = rowsToUnits(header(rowsB), rowsB);
  return env.concat(env.envelopeData(unitsA), env.envelopeData(unitsB));
});

export const coerceSelectionLists = list =>
  list.map(s => {
    const [field, options] = s.split(":");
    return [field, options.split(",")];
  });
