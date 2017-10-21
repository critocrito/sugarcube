import {get, size} from "lodash/fp";
import {flowP, flatmapP, tapP} from "combinators-p";
import {envelope as e} from "@sugarcube/core";
import withSession from "../sheets";
import {rowsToQueries} from "../utils";

const querySource = "sheets_query";

const plugin = (envelope, {log, cfg}) => {
  const client = get("google.client_id", cfg);
  const secret = get("google.client_secret", cfg);
  const refreshToken = get("google.refresh_token", cfg);
  const id = get("google.spreadsheet_id", cfg);
  const queries = e.queriesByType(querySource, envelope);

  log.info(`Fetching ${size(queries)} sheet${size(queries) > 1 ? "s" : ""}`);

  const querySheet = query =>
    withSession(
      async ({getValues}) => {
        const rows = await getValues(id, query);
        const expanded = rowsToQueries(rows);
        log.info(`Expanded ${id}/${query} to ${size(expanded)} queries.`);
        return expanded;
      },
      {client, secret, refreshToken}
    );

  return flowP(
    [
      flatmapP(querySheet),
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
