import {curry, find, getOr} from "lodash/fp";
import {flowP, flowP2, flowP3, flowP4} from "dashp";
import pify from "pify";
import google from "googleapis";

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

// Actions
const createSpreadsheet = flowP([createSpreadsheetRequest, spreadsheetCreate]);
const getSpreadsheet = flowP2([getSpreadsheetRequest, spreadsheetGet]);

const getSheet = curry(async (auth, id, name) => {
  const spreadsheet = await getSpreadsheet(auth, id);
  const sheet = find(["properties.title", name], spreadsheet.sheets);
  return getOr(null, "properties", sheet);
});
const createSheet = flowP3([createSheetRequest, batchUpdate]);
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
  const {sheetId} = await copySheet(auth, id, source.sheetId, to);
  await updateSheet(auth, to, sheetId, {title});
  return getSheet(auth, to, title);
});

const getValues = flowP3([getValuesRequest, get, getOr([], "values")]);
const createValues = flowP4([createValuesRequest, update]);
const clearValues = flowP3([clearValuesRequest, clear]);

// This function provides a context within which to run a series of
// interactions with the Google spreadsheet API.
export default curry(async (f, {client, secret, refreshToken}) => {
  const auth = await authenticate(client, secret, refreshToken);
  const api = {
    createSpreadsheet: createSpreadsheet(auth),
    getSpreadsheet: getSpreadsheet(auth),
    createSheet: createSheet(auth),
    getSheet: getSheet(auth),
    getOrCreateSheet: getOrCreateSheet(auth),
    updateSheet: updateSheet(auth),
    duplicateSheet: duplicateSheet(auth),
    createValues: createValues(auth),
    getValues: getValues(auth),
    clearValues: clearValues(auth),
  };
  return f(api);
});
