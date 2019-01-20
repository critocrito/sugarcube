import {
  curry,
  flow,
  map,
  filter,
  reject,
  pick,
  at,
  tail,
  head,
  zipObjectDeep,
  concat,
  uniq,
  overSome,
  toLower,
  isEmpty,
} from "lodash/fp";
import {envelope as env, queries as qs, utils} from "@sugarcube/core";

const {curry2, curry3} = utils;

const requiredFields = ["_sc_id_hash", "_sc_content_hash"];
const queryFields = ["type", "term"];

export const header = flow([head, map(toLower)]);

const fixBools = map(v => {
  switch (v) {
    case "TRUE":
      return true;
    case "FALSE":
      return false;
    case "":
      return null;
    default:
      return v;
  }
});

const keys = flow([concat(requiredFields), uniq]);
const queryKeys = flow([concat(queryFields), map(toLower), uniq]);

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

// Map SugarCube queries to google spreadheet rows.
export const queriesToRows = curry((fields, queries) => {
  const allFields = queryKeys(fields);
  return concat([allFields], map(at(allFields), queries));
});

// Map google spreadsheet rows to SugarCube units.
export const rowsToUnits = curry((fields, rows) => zipRows(keys(fields), rows));

// Map google spreadsheet rows to SugarCube queries.
export const rowsToQueries = curry3(
  "rowsToQueries",
  (defaultType, fields, rows) =>
    flow([
      ([hs, ...rs]) => [map(toLower, hs)].concat(rs),
      zipRows(queryKeys(fields)),
      filter(row => row.term != null && row.term.length > 0),
      map(row =>
        Object.assign({}, row, {
          term: row.term.trim(),
          type: row.type == null ? defaultType : row.type,
        }),
      ),
      qs.hash,
    ])(rows),
);

export const concatEnvelopeAndRows = curry(({data}, rows) => {
  const units = rowsToUnits(header(rows), rows);
  return env.concat(env.envelopeData(data), env.envelopeData(units));
});

export const concatRows = curry((rowsA, rowsB) => {
  const unitsA = rowsToUnits(header(rowsA), rowsA);
  const unitsB = rowsToUnits(header(rowsB), rowsB);
  return env.concat(env.envelopeData(unitsA), env.envelopeData(unitsB));
});

export const concatQueriesRows = curry((defaultType, rowsA, rowsB) => {
  const queriesA = rowsToQueries(defaultType, header(rowsA), rowsA);
  const queriesB = rowsToQueries(defaultType, header(rowsB), rowsB);
  return env.concat(
    env.envelopeQueries(queriesA),
    env.envelopeQueries(queriesB),
  );
});

export const coerceSelectionLists = list =>
  list.map(s => {
    const [field, options] = s.split(":");
    return [field, options.split(",")];
  });

export const applyFilters = curry2("applyFilters", (filters, rows) => {
  if (filters.length === 0) return rows;
  const [fields, ...data] = rows;
  const matchFilters = overSome(
    filters.map(([fieldName, match]) => row => {
      const index = fields.indexOf(fieldName);
      if (index === -1) return false;
      if (row[index] === match) return true;
      return false;
    }),
  );
  const filteredData = data.reduce((memo, row) => {
    if (matchFilters(row)) return memo.concat([row]);
    return memo;
  }, []);
  return [fields].concat(filteredData);
});

export const intersectQueryRows = (defaultType, queryRows, queries) => {
  const [fields] = queryRows;
  const intersection = env.intersection(
    env.envelopeQueries(
      rowsToQueries(defaultType, queryKeys(fields), queryRows),
    ),
    env.envelopeQueries(queries),
  );
  return queriesToRows(fields, intersection.queries);
};
