import {curry, first, tail, find, findIndex, getOr} from "lodash/fp";
import {collectP, flowP, flowP2, flowP3, flowP4} from "dashp";
import pify from "pify";
import {google} from "googleapis";

import authenticate from "./auth";
import {
  createSpreadsheetRequest,
  getSpreadsheetRequest,
  createSheetRequest,
  updateSheetRequest,
  copySheetRequest,
  getValuesRequest,
  createValuesRequest,
  clearValuesRequest,
  appendValuesRequest,
  deleteSheetRequest,
  deleteRowsRequest,
} from "./requests";

const sheets = google.sheets("v4");

// API promisified
const spreadsheetCreate = pify(sheets.spreadsheets.create);
const spreadsheetGet = pify(sheets.spreadsheets.get);
const sheetCopy = pify(sheets.spreadsheets.sheets.copyTo);
const update = pify(sheets.spreadsheets.values.update);
const batchUpdate = pify(sheets.spreadsheets.batchUpdate);
const get = pify(sheets.spreadsheets.values.get);
const clear = pify(sheets.spreadsheets.values.clear);
const append = pify(sheets.spreadsheets.values.append);

// Actions
const createSpreadsheet = flowP([createSpreadsheetRequest, spreadsheetCreate]);
const getSpreadsheet = flowP2([getSpreadsheetRequest, spreadsheetGet]);

const getSheet = curry(async (auth, id, name) => {
  const {data: spreadsheet} = await getSpreadsheet(auth, id);
  const sheet = find(["properties.title", name], spreadsheet.sheets);
  return getOr(null, "properties", sheet);
});
const createSheet = flowP3([createSheetRequest, batchUpdate]);
const deleteSheet = flowP3([deleteSheetRequest, batchUpdate]);
const copySheet = flowP4([copySheetRequest, sheetCopy]);
const getOrCreateSheet = curry(async (auth, id, name) => {
  const sheet = await getSheet(auth, id, name);
  if (!sheet) {
    await createSheet(auth, id, name);
    return getSheet(auth, id, name);
  }
  return sheet;
});
const updateSheet = flowP4([updateSheetRequest, batchUpdate]);
const duplicateSheet = curry(async (auth, id, from, to, title) => {
  // In case the target already exists
  const target = await getSheet(auth, to, title);
  if (target) return target;
  const source = await getSheet(auth, id, from);
  if (!source) {
    throw new Error("Source Spreadsheet doesn't exist.");
  }
  const {data} = await copySheet(auth, id, source.sheetId, to);
  await updateSheet(auth, to, data.sheetId, {title});
  return getSheet(auth, to, title);
});

// Make sure to make the requests in sequence, since I couldn't find out if
// batchUpdates have a guaranteed order. Instead deleteRowsRequest breaks it
// up in consecutive batchUpdates, where order can be enforced.
const deleteRows = flowP4([deleteRowsRequest, collectP(batchUpdate)]);
const getValues = flowP3([getValuesRequest, get, getOr([], "data.values")]);
const createValues = flowP4([createValuesRequest, update]);
const clearValues = flowP3([clearValuesRequest, clear]);
const appendValues = flowP4([appendValuesRequest, append]);

const getAndRemoveRowsByField = curry(
  async (auth, id, sheetName, fieldName, fieldValue) => {
    const {sheetId} = await getSheet(auth, id, sheetName);
    const rows = await getValues(auth, id, sheetName);
    const header = first(rows);
    const fieldIndex = findIndex(col => col === fieldName, header);
    const [data, indexes] = tail(rows).reduce(
      ([rs, is], row, i) => {
        if (row[fieldIndex] === fieldValue) {
          // Add one to the index since we iterate over rows without the
          // header row.
          return [rs.concat([row]), is.concat(i + 1)];
        }
        return [rs, is];
      },
      [[], []]
    );
    if (data.length === 0) return [];
    await deleteRows(auth, id, sheetId, indexes);
    return [].concat([header]).concat(data);
  }
);

// This function provides a context within which to run a series of
// interactions with the Google spreadsheet API.
export default curry(async (f, {client, secret, tokens}) => {
  const auth = await authenticate(client, secret, tokens);
  const api = {
    createSpreadsheet: () => createSpreadsheet(auth),
    getSpreadsheet: getSpreadsheet(auth),
    createSheet: createSheet(auth),
    deleteSheet: deleteSheet(auth),
    getSheet: getSheet(auth),
    getOrCreateSheet: getOrCreateSheet(auth),
    updateSheet: updateSheet(auth),
    duplicateSheet: duplicateSheet(auth),
    createValues: createValues(auth),
    getValues: getValues(auth),
    clearValues: clearValues(auth),
    appendValues: appendValues(auth),
    deleteRows: deleteRows(auth),
    getAndRemoveRowsByField: getAndRemoveRowsByField(auth),
    tokens: auth.credentials,
  };
  return [await f(api), auth.credentials];
});
