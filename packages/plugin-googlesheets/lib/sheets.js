import {
  curry,
  flow,
  map,
  merge,
  first,
  tail,
  find,
  findIndex,
  get,
  getOr,
  isEqual,
  isNil,
  isString,
} from "lodash/fp";
import {collectP, flowP, flowP2, flowP3, flowP4} from "dashp";
import pify from "pify";
import {google} from "googleapis";

import authenticate from "./auth";
import {
  createSpreadsheetRequest,
  getSpreadsheetRequest,
  createSheetRequest,
  updateSheetPropsRequest,
  copySheetRequest,
  deleteSheetRequest,
  getValuesRequest,
  getHeaderRequest,
  createValuesRequest,
  clearValuesRequest,
  appendValuesRequest,
  deleteRowsRequest,
  setSelectionRequest,
  formatHeaderRequest,
} from "./requests";

const sheets = google.sheets("v4");

// API promisified
const spreadsheetCreate = pify(sheets.spreadsheets.create);
const spreadsheetGet = pify(sheets.spreadsheets.get);
const spreadsheetBatchUpdate = pify(sheets.spreadsheets.batchUpdate);
const sheetCopy = pify(sheets.spreadsheets.sheets.copyTo);
const valuesUpdate = pify(sheets.spreadsheets.values.update);
const valuesGet = pify(sheets.spreadsheets.values.get);
const valuesClear = pify(sheets.spreadsheets.values.clear);
const valuesAppend = pify(sheets.spreadsheets.values.append);

// Actions
const createSpreadsheet = flowP([
  createSpreadsheetRequest,
  spreadsheetCreate,
  get("data"),
]);

const getSpreadsheet = flowP2([
  getSpreadsheetRequest,
  spreadsheetGet,
  get("data"),
]);

const getSheet = curry(async (auth, id, sheet) => {
  const spreadsheet = await getSpreadsheet(auth, id);
  return flow([
    map(({properties: s}) =>
      merge(s, {
        sheetUrl: `${spreadsheet.spreadsheetUrl}#gid=${s.sheetId}`,
      }),
    ),
    find(["title", sheet]),
  ])(spreadsheet.sheets);
});

const createSheet = curry(async (auth, id, sheet) => {
  await flowP3([createSheetRequest, spreadsheetBatchUpdate], auth, id, sheet);
  return getSheet(auth, id, sheet);
});

const deleteSheet = curry(async (auth, id, sheet) => {
  const {sheetId} = await getSheet(auth, id, sheet);
  await flowP3([deleteSheetRequest, spreadsheetBatchUpdate], auth, id, sheetId);
  return null;
});

const getOrCreateSheet = curry(async (auth, id, sheet) => {
  const existingSheet = await getSheet(auth, id, sheet);
  if (!existingSheet) {
    return createSheet(auth, id, sheet);
  }
  return existingSheet;
});

const updateSheetProps = curry(async (auth, id, sheet, props) => {
  const {sheetId} = await getSheet(auth, id, sheet);
  await flowP4(
    [updateSheetPropsRequest, spreadsheetBatchUpdate],
    auth,
    id,
    sheetId,
    props,
  );
  return getSheet(auth, id, props.title ? props.title : sheet);
});

const duplicateSheet = curry(async (auth, id, sheet, toId, toSheet) => {
  // In case the target already exists
  const target = await getSheet(auth, toId, toSheet);
  if (target) return target;
  const source = await getSheet(auth, id, sheet);
  if (isNil(source)) {
    throw new Error("Source Spreadsheet doesn't exist.");
  }
  const {sheetId} = source;
  const {title} = await flowP4(
    [copySheetRequest, sheetCopy, get("data")],
    auth,
    id,
    sheetId,
    toId,
  );
  return updateSheetProps(auth, toId, title, {title: toSheet});
});

const getRows = flowP3([getValuesRequest, valuesGet, getOr([], "data.values")]);

const getHeader = flowP3([
  getHeaderRequest,
  valuesGet,
  getOr([], "data.values"),
  first,
]);

const formatHeader = curry(async (auth, id, sheet) => {
  const {sheetId} = await getSheet(auth, id, sheet);
  return flowP3(
    [formatHeaderRequest, spreadsheetBatchUpdate],
    auth,
    id,
    sheetId,
  );
});

const clearRows = curry(async (auth, id, sheet) => {
  await flowP3([clearValuesRequest, valuesClear], auth, id, sheet);
});

const appendRows = curry(async (auth, id, sheet, rows) => {
  const update = await flowP4(
    [appendValuesRequest, valuesAppend, getOr({}, "data.updates")],
    auth,
    id,
    sheet,
    rows,
  );
  await formatHeader(auth, id, sheet);
  return update;
});

// Make sure to make the requests in sequence, since I couldn't find out if
// batchUpdates have a guaranteed order. Instead deleteRowsRequest breaks it
// up in consecutive batchUpdates, where order can be enforced.
const deleteRows = curry(async (auth, id, sheet, indexes) => {
  const {sheetId} = await getSheet(auth, id, sheet);
  const responses = await flowP4(
    [deleteRowsRequest, collectP(spreadsheetBatchUpdate)],
    auth,
    id,
    sheetId,
    indexes,
  );
  return responses.map(r => r.data);
});

const replaceRows = curry(async (auth, id, sheet, rows) => {
  const updatedData = await flowP4(
    [createValuesRequest, valuesUpdate, get("data")],
    auth,
    id,
    sheet,
    rows,
  );
  await formatHeader(auth, id, sheet);
  return updatedData;
});

const safeReplaceRows = curry(async (auth, id, sheet, rows) => {
  // To be safe not to loose any data, we make first a backup copy and
  // delete it after we exported the new data.
  const bkpSheet = `${sheet}-bk`;
  const {sheetUrl} = await duplicateSheet(auth, id, sheet, id, bkpSheet);
  try {
    await clearRows(auth, id, sheet);
    const updatedData = await replaceRows(auth, id, sheet, rows);
    await deleteSheet(auth, id, bkpSheet);
    return [updatedData];
  } catch (e) {
    Object.assign(e, {spreadsheet: id, sheet: bkpSheet, sheetUrl});
    return [null, e];
  }
});

const getAndRemoveRowsByField = curry(
  async (auth, id, sheet, fieldName, fieldValue) => {
    const rows = await getRows(auth, id, sheet);
    const header = first(rows);
    const fieldIndex = findIndex(isEqual(fieldName), header);
    if (fieldIndex < 0) return [];
    const [data, indexes] = tail(rows).reduce(
      ([rs, is], row, i) => {
        if (row[fieldIndex] === fieldValue) {
          // Add one to the index since we iterate over rows without the
          // header row.
          return [rs.concat([row]), is.concat(i + 1)];
        }
        return [rs, is];
      },
      [[], []],
    );
    if (data.length === 0) return [];
    await deleteRows(auth, id, sheet, indexes);
    return [].concat([header]).concat(data);
  },
);

const setSelection = curry(async (auth, id, sheet, field, selections) => {
  const inputs = isString(selections) ? selections.split(",") : selections;
  const {sheetId} = await getSheet(auth, id, sheet);
  const header = await getHeader(auth, id, sheet);
  const column = findIndex(isEqual(field), header);
  if (column < 0) return Promise.resolve();
  // FIXME: dashp doesn't export flowP5.
  return spreadsheetBatchUpdate(
    setSelectionRequest(auth, id, sheetId, column, inputs),
  );
});

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
    updateSheetProps: updateSheetProps(auth),
    duplicateSheet: duplicateSheet(auth),
    replaceRows: replaceRows(auth),
    safeReplaceRows: safeReplaceRows(auth),
    getRows: getRows(auth),
    getHeader: getHeader(auth),
    clearRows: clearRows(auth),
    appendRows: appendRows(auth),
    deleteRows: deleteRows(auth),
    getAndRemoveRowsByField: getAndRemoveRowsByField(auth),
    setSelection: setSelection(auth),
    formatHeader: formatHeader(auth),
    tokens: auth.credentials,
  };
  return [await f(api), auth.credentials];
});
