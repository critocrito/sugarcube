import {flow, merge, size, tail, get, getOr} from "lodash/fp";
import {flowP, flatmapP, tapP} from "dashp";
import {envelope as env, plugin as p, utils as u} from "@sugarcube/core";
import SheetsDo from "../sheets";
import {
  queriesToRows,
  concatQueriesRows,
  coerceSelectionLists,
  intersectQueryRows,
} from "../utils";
import {assertCredentials, assertSpreadsheet} from "../assertions";

const querySource = "sheets_query";

const moveQueries = async (envelope, {log, cfg, cache, stats}) => {
  const client = get("google.client_id", cfg);
  const secret = get("google.client_secret", cfg);
  const id = get("google.spreadsheet_id", cfg);
  const queryFields = u.sToA(",", getOr([], "google.query_fields", cfg));
  const defaultType = get("google.query_default_type", cfg);
  const queryTypesToMove = u.sToA(
    ",",
    getOr([], "google.query_types_to_move", cfg),
  );
  const copyFromSheet = get("google.copy_from_sheet", cfg);
  const copyFromSpreadsheet = get("google.copy_from_spreadsheet", cfg);
  const toId = getOr(id, "google.to_spreadsheet_id", cfg);
  const toSheet = getOr(cfg.marker, "google.to_sheet", cfg);
  const selectionLists = coerceSelectionLists(
    get("google.selection_list", cfg),
  );
  const queries = env.queriesByType(querySource, envelope);
  let tokens;

  if (copyFromSheet && !copyFromSpreadsheet) {
    throw new Error("Missing configuration: google.copy_from_spreadsheet");
  }
  if (copyFromSpreadsheet && !copyFromSheet) {
    throw new Error("Missing configuration: google.copy_from_sheet");
  }

  const moveQuerySheet = async (query) => {
    const [, t, history] = await SheetsDo(
      function* moveUnits({
        getOrCreateSheet,
        duplicateSheet,
        getRows,
        deleteRows,
        replaceRows,
        safeReplaceRows,
        setSelections,
      }) {
        const allQueryRows = yield getRows(id, query);
        const allQueryTypeIndex = allQueryRows[0].indexOf("type");
        const allQueryTermIndex = allQueryRows[0].indexOf("term");

        const rowsToMove = [allQueryRows[0]].concat(
          tail(allQueryRows)
            .map((r) => {
              if (r[allQueryTypeIndex] != null) return r;
              // eslint-disable-next-line no-param-reassign
              r[allQueryTypeIndex] = defaultType;
              return r;
            })
            .filter((r) => {
              // Only move queries that are in the pipeline.
              if (
                envelope.queries.find(
                  (q) =>
                    q.type === r[allQueryTypeIndex].trim() &&
                    q.term === r[allQueryTermIndex].trim(),
                ) == null
              )
                return false;
              // Move queries if no restrictions on the type are set.
              if (queryTypesToMove.length === 0) return true;
              // Move queries only if the type fits the restrictions.
              return queryTypesToMove.includes(r[allQueryTypeIndex]);
            }),
        );

        if (rowsToMove.length < 2) {
          log.warn("No queries to move. Skip the move.");
          return [];
        }

        const queriesToMove = intersectQueryRows(
          defaultType,
          rowsToMove,
          envelope.queries,
        );

        const {sheetUrl: targetUrl} = copyFromSheet
          ? yield duplicateSheet(
              copyFromSpreadsheet,
              copyFromSheet,
              toId,
              toSheet,
            )
          : yield getOrCreateSheet(toId, toSheet);
        const existingRows = yield getRows(toId, toSheet);

        log.info(`Moving ${rowsToMove.length - 1} queries to ${targetUrl}.`);
        log.info(
          `Merging ${rowsToMove.length - 1} queries into ${
            existingRows.length - 1
          } queries.`,
        );
        stats.count("total", rowsToMove.length);
        stats.count("existing", existingRows.length);

        const mergedRows = flow([
          concatQueriesRows(defaultType, existingRows),
          get("queries"),
          queriesToRows(queryFields),
        ])(queriesToMove);

        // No need to safely update data if the sheet is empty.
        if (size(existingRows) === 0) {
          yield replaceRows(toId, toSheet, mergedRows);
        } else {
          const [, e] = yield safeReplaceRows(toId, toSheet, mergedRows);
          if (e) {
            log.error(`Atomic data replace of target failed.`);
            log.error(`Backup sheet ${e.sheet} is located at ${e.sheetUrl}.`);
            throw e;
          }
        }

        // Clean existing sheet.
        const typeIndex = rowsToMove[0].indexOf("type");
        const termIndex = rowsToMove[0].indexOf("term");
        const indexesToDelete = tail(rowsToMove).reduce((memo, row) => {
          const index = allQueryRows.findIndex(
            (r) =>
              r[allQueryTypeIndex] === row[typeIndex] &&
              r[allQueryTermIndex] === row[termIndex],
          );
          if (index >= 0) return memo.concat(index);
          return memo;
        }, []);
        yield deleteRows(id, query, indexesToDelete);

        // Set selections on the source and target sheet.
        yield setSelections(toId, query, selectionLists);
        yield setSelections(id, toSheet, selectionLists);

        return mergedRows;
      },
      {client, secret, tokens: cache.get("sheets.tokens")},
    );
    history.forEach(([k, meta]) => log.debug(`${k}: ${JSON.stringify(meta)}.`));
    tokens = t;
  };

  return flowP(
    [
      flatmapP(moveQuerySheet),
      tapP(() => {
        if (tokens != null) cache.update("sheets.tokens", merge(tokens));
      }),
      () => envelope,
    ],
    queries,
  );
};

const plugin = p.liftManyA2([
  assertCredentials,
  assertSpreadsheet,
  moveQueries,
]);

plugin.desc = "Import SugarCube data from a google spreadsheet";

plugin.argv = {
  "google.to_spreadsheet_id": {
    type: "string",
    desc: "Move units from google.spreadsheet_id to this spreadsheet.",
  },
  "google.to_sheet": {
    type: "string",
    desc: "Move units from google.sheet to this sheet.",
  },
  "google.copy_from_sheet": {
    type: "string",
    desc: "Duplicate this sheet before exporting to the copy.",
  },
  "google.copy_from_spreadsheet": {
    type: "string",
    desc: "Duplicate a sheet from this spreadsheet ID.",
  },
  "google.query_types_to_move": {
    desc: "Move only specified query types.",
    nargs: 1,
    type: "string",
  },
};

export default plugin;
