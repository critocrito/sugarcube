import {size, get, getOr} from "lodash/fp";
import {envelope as env} from "@sugarcube/core";

import {valuesToUnits} from "../utils";

import {getValues} from "../sheets";
import authenticate from "../auth";

// TODO: case for then no _sc_id_hash exists
// possibly rename this one update_from_sheet
const plugin = (envelope, {log, cfg}) => {
  const clientId = get("google.client_id", cfg);
  const clientSecret = get("google.client_secret", cfg);
  const projectId = get("google.project_id", cfg);
  const token = get("google.token", cfg);
  const spreadsheetId = get("google.spreadsheet_id", cfg);
  const sheet = get("google.sheet", cfg);
  const sheetFields = getOr([], "google.sheet_fields", cfg);

  log.info("Importing data from google sheets");

  return authenticate(clientId, clientSecret, projectId, token)
    .then(auth =>
      getValues(auth, spreadsheetId, sheet)
        .then(response => valuesToUnits(sheetFields, response.values))
        .catch(e => {
          log.error(`The Google Sheets API returned an error: ${e}`);
          return envelope;
        })
    )
    .then(units => {
      log.info("Spreadsheet retrieved");
      log.info(`Updating ${size(units)} units from sheet`);
      return env.concatData(units, envelope);
    })
    .catch(e => {
      log.error(e);
      return envelope;
    });
};

plugin.desc = "Import SugarCube data from a google spreadsheet";

plugin.argv = {
  "google.sheet": {
    type: "text",
    default: "Sheet1",
    desc: "Name of the sheet in the spreadsheet to import",
  },
};

export default plugin;
