import Promise from "bluebird";
import {curry} from "lodash/fp";
import google from "googleapis";

import {
  getValuesRequest,
  addValuesRequest,
  addSheetRequest,
  copyFormattingRequest,
  copyValidationRequest,
} from "./requests";

const sheets = google.sheets("v4");

// turn google sheets functions into promises

const update = req =>
  new Promise((resolve, reject) => {
    sheets.spreadsheets.values.update(req, (err, response) => {
      if (err) {
        reject(err);
      }
      resolve(response);
    });
  });

const batchUpdate = req =>
  new Promise((resolve, reject) => {
    sheets.spreadsheets.batchUpdate(req, (err, response) => {
      if (err) {
        reject(err);
      }
      resolve(response);
    });
  });

const get = req =>
  new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get(req, (err, response) => {
      if (err) {
        reject(err);
      }
      resolve(response);
    });
  });

// the basket of exportables ///////////////////////

export const addSheet = curry(
  // TODO: any way to reduce this code?
  (auth, spreadsheetId, name) =>
    batchUpdate(addSheetRequest(auth, spreadsheetId, name))
);

export const copyFormatting = curry(
  (auth, spreadsheetId, fromSheetId, toSheetId) =>
    batchUpdate(
      copyFormattingRequest(auth, spreadsheetId, fromSheetId, toSheetId)
    )
);

export const copyValidation = curry(
  (auth, spreadsheetId, fromSheetId, toSheetId) =>
    batchUpdate(
      copyValidationRequest(auth, spreadsheetId, fromSheetId, toSheetId)
    )
);

export const addValues = curry((auth, spreadsheetId, sheet, values) =>
  update(addValuesRequest(auth, spreadsheetId, sheet, values))
);

export const getValues = curry((auth, spreadsheetId, sheet) =>
  get(getValuesRequest(auth, spreadsheetId, sheet))
);

export const copyVF = curry((auth, spreadsheetId, fromSheetId, toSheetId) =>
  copyFormatting(auth, spreadsheetId, fromSheetId, toSheetId).then(() =>
    copyValidation(auth, spreadsheetId, fromSheetId, toSheetId)
  )
);

export default {
  addSheet,
  copyFormatting,
  copyValidation,
  copyVF,
  addValues,
  getValues,
};
