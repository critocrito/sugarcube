import {merge, get, getOr} from "lodash/fp";
import {flowP, flatmapP, tapP} from "dashp";
import {envelope as env, plugin as p, utils as u} from "@sugarcube/core";
import SheetsDo from "../sheets";
import {rowsToQueries} from "../utils";
import {assertCredentials, assertSpreadsheet} from "../assertions";

const querySource = "sheets_query";

const importQueries = (envelope, {log, cfg, cache}) => {
  const client = get("google.client_id", cfg);
  const secret = get("google.client_secret", cfg);
  const id = get("google.spreadsheet_id", cfg);
  const defaultType = get("google.query_default_type", cfg);
  const queryFields = u.sToA(",", getOr([], "google.query_fields", cfg));
  const queries = env.queriesByType(querySource, envelope);
  let tokens;

  log.info(`Fetching ${queries.length} sheet${queries.length > 1 ? "s" : ""}`);

  const querySheet = async query => {
    const [qs, t, history] = await SheetsDo(
      function* fetchQueries({getSheet, getRows}) {
        const {sheetUrl} = yield getSheet(id, query);
        const rows = yield getRows(id, query);
        const expanded = rowsToQueries(defaultType, queryFields, rows);
        const count = expanded.length;

        log.info(
          `Expanded ${sheetUrl} to ${count} ${
            count > 1 ? "queries" : "query"
          }.`,
        );

        return expanded;
      },
      {client, secret, tokens: cache.get("sheets.tokens")},
    );
    history.forEach(([k, meta]) => log.debug(`${k}: ${JSON.stringify(meta)}.`));
    tokens = t;
    return qs;
  };

  return flowP(
    [
      flatmapP(querySheet),
      tapP(rs => {
        const count = rs.length;
        log.info(`Fetched a total of ${count} quer${count > 1 ? "ies" : "y"}.`);
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

plugin.argv = {
  "google.query_default_type": {
    desc: "Specify the default query type if none is provided as a type.",
    nargs: 1,
    type: "string",
  },
  "google.query_fields": {
    type: "string",
    desc: "Additional fields to import into queries besides term and type.",
  },
};

export default plugin;
