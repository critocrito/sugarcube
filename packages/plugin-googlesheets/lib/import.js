import {size, get} from "lodash/fp";
import {envelope as env} from "@sugarcube/core";

import {valuesToUnits} from "./utils";

import {getValues} from "./sheets";
import authenticate from "./auth";

// TODO: case for then no _sc_id_hash exists
// possibly rename this one update_from_sheet

const plugin = (envelope, {log, cfg}) => {
  log.info("Importing data from google sheets");

  const spreadsheetId = cfg.google.spreadsheet_id;

  const sheet = get("google.sheet")(cfg);

  return authenticate(log, cfg)
    .then(auth =>
      getValues(auth, spreadsheetId, sheet)
        .then(response => valuesToUnits(response.values))
        .catch(e => {
          log.error(`The Google Sheets API returned an error: ${e}`);
          return envelope;
        })
    )
    .then(units => {
      log.info("Spreadsheet retrieved");
      log.info(`Updating ${size(units)} units from sheet`); // try concatData from lf data
      // const nu = merge(                                 // TODO: better way to do this....
      //   keyBy('_sc_id_hash')(envelope.data),            // there must be a LF util for this
      //   keyBy('_sc_id_hash')(units)                     // does lf automatically do this actually?
      // );
      // return set('data', values(nu))(envelope);
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
