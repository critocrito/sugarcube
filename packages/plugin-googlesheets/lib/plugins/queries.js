import {merge, get, size} from "lodash/fp";
import {flowP, flatmapP, tapP} from "dashp";
import {envelope as env, plugin as p} from "@sugarcube/core";
import withSession from "../sheets";
import {rowsToQueries} from "../utils";
import {assertCredentials, assertSpreadsheet} from "../assertions";

const querySource = "sheets_query";

const importQueries = (envelope, {log, cfg, cache}) => {
  const client = get("google.client_id", cfg);
  const secret = get("google.client_secret", cfg);
  const id = get("google.spreadsheet_id", cfg);
  const queries = env.queriesByType(querySource, envelope);
  let tokens;

  log.info(`Fetching ${size(queries)} sheet${size(queries) > 1 ? "s" : ""}`);

  const querySheet = async query => {
    const [qs, t] = await withSession(
      async ({getRows}) => {
        const rows = await getRows(id, query);
        const expanded = rowsToQueries(rows);
        log.info(`Expanded ${id}/${query} to ${size(expanded)} queries.`);
        return expanded;
      },
      {client, secret, tokens: cache.get("sheets.tokens")},
    );
    tokens = t;
    return qs;
  };

  return flowP(
    [
      flatmapP(querySheet),
      tapP(rs => {
        log.info(`Fetched ${size(rs)} quer${size(rs) > 1 ? "ies" : "y"}.`);
        cache.update("sheets.tokens", merge(tokens));
      }),
      rs => env.concatQueries(rs, envelope),
    ],
    queries,
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
