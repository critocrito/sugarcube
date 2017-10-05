import {curry} from "lodash/fp";

// weird google request formats hidden away in this nice file

export const getValuesRequest = curry((auth, spreadsheetId, sheet) => ({
  auth,
  valueRenderOption: "FORMATTED_VALUE",
  dateTimeRenderOption: "SERIAL_NUMBER",
  spreadsheetId,
  range: sheet,
}));

export const addValuesRequest = curry((auth, spreadsheetId, sheet, values) => ({
  auth,
  resource: {values},
  valueInputOption: "USER_ENTERED",
  spreadsheetId,
  range: `${sheet}!A1`,
}));

export const addSheetRequest = curry((auth, spreadsheetId, marker) => ({
  auth,
  spreadsheetId,
  resource: {
    requests: [
      {
        addSheet: {
          properties: {
            title: marker,
            gridProperties: {
              rowCount: 20,
              columnCount: 12,
            },
            tabColor: {
              red: 1.0,
              green: 0.3,
              blue: 0.4,
            },
          },
        },
      },
    ],
  },
}));

const copyRequest = curry(
  (pasteType, auth, spreadsheetId, fromSheetId, toSheetId) => ({
    auth,
    spreadsheetId,
    resource: {
      requests: [
        {
          copyPaste: {
            source: {
              sheetId: fromSheetId,
              startRowIndex: 0,
              endRowIndex: 1000,
              startColumnIndex: 0,
              endColumnIndex: 1000,
            },
            destination: {
              sheetId: toSheetId,
              startRowIndex: 0,
              endRowIndex: 1000,
              startColumnIndex: 0,
              endColumnIndex: 1000,
            },
            pasteType,
            pasteOrientation: "NORMAL",
          },
        },
      ],
    },
  })
);

export const copyFormattingRequest = copyRequest("PASTE_FORMAT");

export const copyValidationRequest = copyRequest("PASTE_DATA_VALIDATION");

// /////////////////////////////////////////////////////////

export default {
  getValuesRequest,
  addValuesRequest,
  addSheetRequest,
  copyFormattingRequest,
  copyValidationRequest,
};
