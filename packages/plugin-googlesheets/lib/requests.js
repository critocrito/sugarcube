import {curry, merge, last, get} from "lodash/fp";

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

export const getHeaderRequest = curry((auth, spreadsheetId, sheet) => ({
  auth,
  valueRenderOption: "FORMATTED_VALUE",
  dateTimeRenderOption: "SERIAL_NUMBER",
  spreadsheetId,
  range: `${sheet}!1:1`,
}));

export const createValuesRequest = curry(
  (auth, spreadsheetId, sheet, values) => ({
    auth,
    resource: {values},
    valueInputOption: "USER_ENTERED",
    spreadsheetId,
    range: `${sheet}!A1`,
  }),
);

export const copySheetRequest = curry(
  (auth, spreadsheetId, sheetId, targetId) => ({
    auth,
    spreadsheetId,
    sheetId,
    resource: {
      destinationSpreadsheetId: `${targetId}`,
    },
  }),
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

export const updateSheetPropsRequest = curry(
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
  }),
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
  }),
);

export const deleteSheetRequest = curry((auth, spreadsheetId, sheetId) => ({
  auth,
  spreadsheetId,
  resource: {
    requests: [{deleteSheet: {sheetId}}],
  },
}));

export const deleteRowsRequest = curry((auth, spreadsheetId, sheetId, rows) => {
  const startPath = "resource.requests[0].deleteDimension.range.startIndex";
  const endPath = "resource.requests[0].deleteDimension.range.endIndex";

  const body = (start, end) => ({
    auth,
    spreadsheetId,
    resource: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              startIndex: start,
              endIndex: end,
              dimension: "ROWS",
            },
          },
        },
      ],
    },
  });

  // We remove rows starting at the end to prevent previous requests
  // shifting row index numbers. Index numbers are zero based. An index of 1
  // will delete the row with the row number of 2 in the spreadsheet.
  return rows
    .map(i => parseInt(i, 10))
    .sort((a, b) => a - b)
    .reverse()
    .reduce((memo, row) => {
      const lastRow = last(memo);
      const startIndex = get(startPath, lastRow);
      const endIndex = get(endPath, lastRow);

      // determine if this and the previous row are consecutive, and merge the
      // batch request.
      if (startIndex - 1 === row) {
        return memo.slice(0, -1).concat(body(row, endIndex));
      }
      return memo.concat(body(row, row + 1));
    }, []);
});

export const setSelectionRequest = curry(
  (auth, spreadsheetId, sheetId, column, inputs) => ({
    auth,
    spreadsheetId,
    resource: {
      requests: [
        {
          setDataValidation: {
            range: {
              sheetId,
              startRowIndex: 1,
              startColumnIndex: column,
              endColumnIndex: column + 1,
            },
            rule: {
              condition: {
                type: "ONE_OF_LIST",
                values: [inputs.map(i => ({userEnteredValue: i}))],
              },
              strict: true,
              showCustomUi: true,
            },
          },
        },
      ],
    },
  }),
);

export const formatHeaderRequest = curry((auth, spreadsheetId, sheetId) => ({
  auth,
  spreadsheetId,
  resource: {
    requests: [
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: 0,
                green: 0,
                blue: 0,
              },
              horizontalAlignment: "CENTER",
              textFormat: {
                foregroundColor: {
                  red: 1,
                  green: 1,
                  blue: 1,
                },
                fontSize: 8,
                bold: true,
              },
              borders: {
                left: {
                  style: "SOLID",
                  color: {red: 1, green: 1, blue: 1},
                },
                right: {
                  style: "SOLID",
                  color: {red: 1, green: 1, blue: 1},
                },
              },
            },
          },
          fields:
            "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,borders)",
        },
      },
      {
        updateSheetProperties: {
          properties: {
            sheetId,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          fields: "gridProperties.frozenRowCount",
        },
      },
    ],
  },
}));
