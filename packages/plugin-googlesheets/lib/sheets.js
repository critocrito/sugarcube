import {curry} from "lodash/fp";
import {flowP3, flowP4} from "combinators-p";
import pify from "pify";
import google from "googleapis";

import {
  getValuesRequest,
  addValuesRequest,
  addSheetRequest,
  copyFormattingRequest,
  copyValidationRequest,
} from "./requests";

const sheets = google.sheets("v4");
const update = pify(sheets.spreadsheets.values.update);
const batchUpdate = pify(sheets.spreadsheets.batchUpdate);
const get = pify(sheets.spreadsheets.values.get);

// the basket of exportables
export const addSheet = flowP3([addSheetRequest, batchUpdate]);

export const getValues = flowP3([getValuesRequest, get]);

export const copyFormatting = flowP4([copyFormattingRequest, batchUpdate]);

export const copyValidation = flowP4([copyValidationRequest, batchUpdate]);

export const addValues = flowP4([addValuesRequest, update]);

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
