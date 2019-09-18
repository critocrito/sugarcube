import {merge, get, getOr} from "lodash/fp";
import {flowP, flatmapP, tapP} from "dashp";
import {envelope as env, plugin as p, utils as u} from "@sugarcube/core";
import SheetsDo from "../sheets";
import {rowsToQueries, coerceSelectionLists} from "../utils";
import {assertCredentials, assertSpreadsheet} from "../assertions";

const querySource = "sheets_query";

const importQueries = (envelope, {log, cfg, cache, stats}) => {
  const client = get("google.client_id", cfg);
  const secret = get("google.client_secret", cfg);
  const id = get("google.spreadsheet_id", cfg);
  const defaultType = get("google.query_default_type", cfg);
  const queryFields = u.sToA(",", getOr([], "google.query_fields", cfg));
  const selectionLists = coerceSelectionLists(
    get("google.selection_list", cfg),
  );
  const queries = env.queriesByType(querySource, envelope);
  let tokens;

  log.info(`Fetching ${queries.length} sheet${queries.length > 1 ? "s" : ""}`);

  const querySheet = async query => {
    const [qs, t, history] = await SheetsDo(
      function* fetchQueries({
        getSheet,
        getRows,
        safeReplaceRows,
        setSelections,
      }) {
        const now = new Date();
        const sheet = yield getSheet(id, query);
        if (sheet == null) {
          log.warn(`Failed to fetch sheet ${query} of spreadsheet ${id}`);
          return [];
        }
        const {sheetUrl} = sheet;
        const rows = yield getRows(id, query);

        if (rows.length < 2) {
          log.warn(`The ${query} sheet didn't yield any queries.`);
          return [];
        }

        const expanded = rowsToQueries(defaultType, queryFields, rows);
        const count = expanded.length;

        log.info(
          `Expanded ${sheetUrl} to ${count} ${
            count > 1 ? "queries" : "query"
          }.`,
        );

        stats.count("total", count);

        // Update the last access field
        const header = rows[0].includes("last access")
          ? rows[0]
          : rows[0].concat("last access");
        const lastAccessIndex = header.indexOf("last access");
        const rowsToMerge = [header].concat(
          rows.slice(1).map(row =>
            row
              .slice(0, lastAccessIndex)
              .concat(now)
              .concat(row.slice(lastAccessIndex + 1)),
          ),
        );

        const [, e] = yield safeReplaceRows(id, query, rowsToMerge);
        if (e) {
          log.error(`Atomic data replace of target failed.`);
          log.error(`Backup sheet ${e.sheet} is located at ${e.sheetUrl}.`);
          throw e;
        }

        // Set data validations for selections.
        yield setSelections(id, query, selectionLists);

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
        if (tokens != null) cache.update("sheets.tokens", merge(tokens));
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
