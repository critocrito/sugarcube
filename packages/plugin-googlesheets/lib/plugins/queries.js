import {get, size} from "lodash/fp";
import {flowP, collectP, flatmapP, tapP} from "combinators-p";
import {envelope as e} from "@sugarcube/core";

import {getValues} from "../sheets";
import authenticate from "../auth";

const querySource = "sheets_query";

const plugin = (envelope, {log, cfg}) => {
  const clientId = get("google.client_id", cfg);
  const clientSecret = get("google.client_secret", cfg);
  const projectId = get("google.project_id", cfg);
  const token = get("google.token", cfg);
  const spreadsheetId = get("google.spreadsheet_id", cfg);
  const queries = e.queriesByType(querySource, envelope);

  log.info(`Fetching ${size(queries)} sheet${size(queries) > 1 ? "s" : ""}`);

  const querySheet = async query => {
    const auth = await authenticate(clientId, clientSecret, projectId, token);
    const sheet = await getValues(auth, spreadsheetId, query);
    log.info(
      `Fetched ${size(sheet.values)} queries from ${spreadsheetId}/${query}`
    );
    return sheet.values;
  };

  return flowP(
    [
      flatmapP(querySheet),
      collectP(([type, term]) => ({type, term})),
      tapP(rs =>
        log.info(`Fetched ${size(rs)} quer${size(rs) > 1 ? "ies" : "y"}.`)
      ),
      rs => e.concatQueries(rs, envelope),
    ],
    queries
  );
};

plugin.desc = "Fetch queries from a Google Sheet.";

plugin.argv = {};

export default plugin;
