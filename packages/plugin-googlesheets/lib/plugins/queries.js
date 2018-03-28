import {get, size} from "lodash/fp";
import {flowP, flatmapP, tapP} from "dashp";
import {envelope as env, plugin as p} from "@sugarcube/core";
import withSession from "../sheets";
import {rowsToQueries} from "../utils";
import {assertCredentials, assertSpreadsheet} from "../assertions";

const querySource = "sheets_query";

const importQueries = (envelope, {log, cfg}) => {
  const client = get("google.client_id", cfg);
  const secret = get("google.client_secret", cfg);
  const id = get("google.spreadsheet_id", cfg);
  const queries = env.queriesByType(querySource, envelope);

  log.info(`Fetching ${size(queries)} sheet${size(queries) > 1 ? "s" : ""}`);

  const querySheet = query =>
    withSession(
      async ({getValues}) => {
        const rows = await getValues(id, query);
        const expanded = rowsToQueries(rows);
        log.info(`Expanded ${id}/${query} to ${size(expanded)} queries.`);
        return expanded;
      },
      {client, secret}
    );

  return flowP(
    [
      flatmapP(querySheet),
      tapP(rs =>
        log.info(`Fetched ${size(rs)} quer${size(rs) > 1 ? "ies" : "y"}.`)
      ),
      rs => env.concatQueries(rs, envelope),
    ],
    queries
  );
};

const plugin = p.liftManyA2([
  assertCredentials,
  assertSpreadsheet,
  importQueries,
]);

plugin.desc = "Fetch queries from a Google Sheet.";

plugin.argv = {};

export default plugin;
