import {get} from "lodash/fp";

import authenticate from "../auth";
import {addSheet, addValues, copyVF} from "../sheets";

import {unitsToValues} from "../utils";

const plugin = (envelope, {log, cfg}) => {
  log.info("Exporting data to google sheets");

  const spreadsheetId = cfg.google.spreadsheet_id;

  const data = unitsToValues(envelope.data, get("google.sheet_fields", cfg));

  const sheetName = cfg.marker;

  const copyFromSheet = cfg.google.copy_formatting_from;

  return authenticate(log, cfg)
    .then(auth => {
      const copy = copyVF(auth, spreadsheetId);
      const addV = addValues(auth, spreadsheetId);

      return addSheet(auth, spreadsheetId, sheetName).then(r => {
        const id = r.replies[0].addSheet.properties.sheetId;
        const name = r.replies[0].addSheet.properties.title;

        if (!copyFromSheet) {
          return addV(name, data);
        }
        return copy(copyFromSheet, id).then(() => addV(name, data));
      });
    })
    .then(response => {
      log.info(
        `Spreadsheet updated at: https://docs.google.com/spreadsheets/d/${response.spreadsheetId}/edit`
      );
      log.info(
        `Updated Sheet ${response.updatedRange}, ${response.updatedRows} rows`
      );
      return envelope;
    })
    .catch(e => {
      log.error(`The Google Sheets API returned an error: ${e}`);
      return envelope;
    });
};

plugin.desc = "Export SugarCube data to a google spreadsheet";

plugin.argv = {
  "google.copy_formatting_from": {
    type: "text",
    desc:
      "Copy Data Validation and Formatting from this sheet to the exported (sheet id, not name)",
  },
};

export default plugin;
