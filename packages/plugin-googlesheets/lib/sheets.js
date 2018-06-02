import {
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
import {ofP, collectP, flowP, flowP2, flowP3, flowP4} from "dashp";
import pify from "pify";
import {utils} from "@sugarcube/core";
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

const {curry2, curry3, curry4, curry5} = utils;
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

const getSpreadsheet = curry2("getSpreadsheet", (id, auth) =>
  flowP2([getSpreadsheetRequest, spreadsheetGet, get("data")])(auth, id),
);

const getSheet = curry3("getSheet", async (id, sheet, auth) => {
  const spreadsheet = await getSpreadsheet(id, auth);
  return flow([
    map(({properties: s}) =>
      merge(s, {
        sheetUrl: `${spreadsheet.spreadsheetUrl}#gid=${s.sheetId}`,
      }),
    ),
    find(["title", sheet]),
  ])(spreadsheet.sheets);
});

const createSheet = curry3("createSheet", async (id, sheet, auth) => {
  await flowP3([createSheetRequest, spreadsheetBatchUpdate], auth, id, sheet);
  return getSheet(id, sheet, auth);
});

const deleteSheet = curry3("deleteSheet", async (id, sheet, auth) => {
  const {sheetId} = await getSheet(id, sheet, auth);
  await flowP3([deleteSheetRequest, spreadsheetBatchUpdate], auth, id, sheetId);
  return null;
});

const getOrCreateSheet = curry3("getOrCreateSheet", async (id, sheet, auth) => {
  const existingSheet = await getSheet(id, sheet, auth);
  if (!existingSheet) {
    return createSheet(id, sheet, auth);
  }
  return existingSheet;
});

const updateSheetProps = curry4(
  "updateSheet",
  async (id, sheet, props, auth) => {
    const {sheetId} = await getSheet(id, sheet, auth);
    await flowP4(
      [updateSheetPropsRequest, spreadsheetBatchUpdate],
      auth,
      id,
      sheetId,
      props,
    );
    return getSheet(id, props.title ? props.title : sheet, auth);
  },
);

const duplicateSheet = curry5(
  "duplicateSheet",
  async (id, sheet, toId, toSheet, auth) => {
    // In case the target already exists
    const target = await getSheet(toId, toSheet, auth);
    if (target) return target;
    const source = await getSheet(id, sheet, auth);
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
    return updateSheetProps(toId, title, {title: toSheet}, auth);
  },
);

const getRows = curry3("getRows", (id, sheet, auth) =>
  flowP3([getValuesRequest, valuesGet, getOr([], "data.values")])(
    auth,
    id,
    sheet,
  ),
);

const getHeader = curry3("getHeader", (id, sheet, auth) =>
  flowP3([getHeaderRequest, valuesGet, getOr([], "data.values"), first])(
    auth,
    id,
    sheet,
  ),
);

const formatHeader = curry3("formatHeader", async (id, sheet, auth) => {
  const {sheetId} = await getSheet(id, sheet, auth);
  return flowP3(
    [formatHeaderRequest, spreadsheetBatchUpdate],
    auth,
    id,
    sheetId,
  );
});

const clearRows = curry3("clearRows", async (id, sheet, auth) => {
  await flowP3([clearValuesRequest, valuesClear], auth, id, sheet);
});

const appendRows = curry4("appendRows", async (id, sheet, rows, auth) => {
  const update = await flowP4(
    [appendValuesRequest, valuesAppend, getOr({}, "data.updates")],
    auth,
    id,
    sheet,
    rows,
  );
  await formatHeader(id, sheet, auth);
  return update;
});

// Make sure to make the requests in sequence, since I couldn't find out if
// batchUpdates have a guaranteed order. Instead deleteRowsRequest breaks it
// up in consecutive batchUpdates, where order can be enforced.
const deleteRows = curry4("deleteRows", async (id, sheet, indexes, auth) => {
  const {sheetId} = await getSheet(id, sheet, auth);
  const responses = await flowP4(
    [deleteRowsRequest, collectP(spreadsheetBatchUpdate)],
    auth,
    id,
    sheetId,
    indexes,
  );
  return responses.map(r => r.data);
});

const replaceRows = curry4("replaceRows", async (id, sheet, rows, auth) => {
  const updatedData = await flowP4(
    [createValuesRequest, valuesUpdate, get("data")],
    auth,
    id,
    sheet,
    rows,
  );
  await formatHeader(id, sheet, auth);
  return updatedData;
});

const safeReplaceRows = curry4(
  "safeReplaceRows",
  async (id, sheet, rows, auth) => {
    // To be safe not to loose any data, we make first a backup copy and
    // delete it after we exported the new data.
    const bkpSheet = `${sheet}-bk`;
    const {sheetUrl} = await duplicateSheet(id, sheet, id, bkpSheet, auth);
    try {
      await clearRows(id, sheet, auth);
      const updatedData = await replaceRows(id, sheet, rows, auth);
      await deleteSheet(id, bkpSheet, auth);
      return [updatedData];
    } catch (e) {
      Object.assign(e, {spreadsheet: id, sheet: bkpSheet, sheetUrl});
      return [null, e];
    }
  },
);

const getAndRemoveRowsByField = curry5(
  "getAndRemoveRowsByField",
  async (id, sheet, fieldName, fieldValue, auth) => {
    const rows = await getRows(id, sheet, auth);
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
    await deleteRows(id, sheet, indexes, auth);
    return [].concat([header]).concat(data);
  },
);

const setSelection = curry5(
  "setSelection",
  async (id, sheet, field, selections, auth) => {
    const inputs = isString(selections) ? selections.split(",") : selections;
    const {sheetId} = await getSheet(id, sheet, auth);
    const header = await getHeader(id, sheet, auth);
    const column = findIndex(isEqual(field), header);
    if (column < 0) return Promise.resolve();
    // FIXME: dashp doesn't export flowP5.
    return spreadsheetBatchUpdate(
      setSelectionRequest(auth, id, sheetId, column, inputs),
    );
  },
);

const setSelections = curry4("setSelections", (id, sheet, selections, auth) =>
  Promise.all(
    selections.map(([field, inputs]) =>
      setSelection(id, sheet, field, inputs, auth),
    ),
  ),
);

const api = {
  createSpreadsheet,
  getSpreadsheet,
  createSheet,
  deleteSheet,
  getSheet,
  getOrCreateSheet,
  updateSheetProps,
  duplicateSheet,
  replaceRows,
  safeReplaceRows,
  getRows,
  getHeader,
  clearRows,
  appendRows,
  deleteRows,
  getAndRemoveRowsByField,
  formatHeader,
  setSelection,
  setSelections,
};

export default curry2("SheetsDo", async (G, {client, secret, tokens}) => {
  const auth = await authenticate(client, secret, tokens);
  const generator = G(api);
  let data;
  let history = [];

  const chain = async nextG => {
    const {done, value: func} = await nextG.next(data);
    if (done) return ofP(func || data);
    const startTime = process.hrtime();
    const result = await func(auth);
    const timeTook = process.hrtime(startTime);
    // All curried function names have the format of <name>-<int> where
    // <int> is the number of missing arguments. For a prettier output in
    // the history strip -<int> from the name.
    history = history.concat([
      [func.name.replace(/-.*$/, ""), {took: timeTook[0]}],
    ]);
    data = result;
    return chain(nextG);
  };

  return ofP(chain(generator)).then(result => [
    result,
    auth.credentials,
    history,
  ]);
});
