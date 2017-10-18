import {get, getOr} from "lodash/fp";

import authenticate from "../auth";
import {addSheet, addValues, copyVF} from "../sheets";

import {unitsToValues} from "../utils";

const plugin = (envelope, {log, cfg}) => {
  const clientId = get("google.client_id", cfg);
  const clientSecret = get("google.client_secret", cfg);
  const projectId = get("google.project_id", cfg);
  const token = get("google.token", cfg);
  const spreadsheetId = get("google.spreadsheet_id", cfg);
  const sheetFields = getOr([], "google.sheet_fields", cfg);
  const copyFromSheet = get("google.copy_formatting_from", cfg);
  const sheetName = getOr(cfg.marker, "google.sheet", cfg);

  const data = unitsToValues(sheetFields, envelope.data);

  log.info("Exporting data to google sheets");

  return authenticate(clientId, clientSecret, projectId, token)
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
