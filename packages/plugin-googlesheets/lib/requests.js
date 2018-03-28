import {curry, merge} from "lodash/fp";

export const createSpreadsheetRequest = auth => ({
  auth,
});

export const getSpreadsheetRequest = curry((auth, spreadsheetId) => ({
  auth,
  spreadsheetId,
}));

export const getValuesRequest = curry((auth, spreadsheetId, sheet) => ({
  auth,
  valueRenderOption: "FORMATTED_VALUE",
  dateTimeRenderOption: "SERIAL_NUMBER",
  spreadsheetId,
  range: sheet,
}));

export const createValuesRequest = curry(
  (auth, spreadsheetId, sheet, values) => ({
    auth,
    resource: {values},
    valueInputOption: "USER_ENTERED",
    spreadsheetId,
    range: `${sheet}!A1`,
  })
);

export const copySheetRequest = curry(
  (auth, spreadsheetId, sheetId, targetId) => ({
    auth,
    spreadsheetId,
    sheetId,
    resource: {
      destinationSpreadsheetId: `${targetId}`,
    },
  })
);

export const createSheetRequest = curry((auth, spreadsheetId, title) => ({
  auth,
  spreadsheetId,
  resource: {
    requests: [
      {
        addSheet: {
          properties: {
            title,
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

export const updateSheetRequest = curry(
  (auth, spreadsheetId, sheetId, props) => ({
    auth,
    spreadsheetId,
    resource: {
      requests: [
        {
          updateSheetProperties: {
            properties: merge(props, {sheetId}),
            // TODO: This fails to create the fields for nested objects.
            fields: Object.keys(props).join(","),
          },
        },
      ],
    },
  })
);

export const clearValuesRequest = curry((auth, spreadsheetId, sheet) => ({
  auth,
  spreadsheetId,
  range: sheet,
}));

export const appendValuesRequest = curry(
  (auth, spreadsheetId, sheet, values) => ({
    auth,
    spreadsheetId,
    range: sheet,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    resource: {values},
  })
);
