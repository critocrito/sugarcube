import {flow, merge, size, tail, get, getOr} from "lodash/fp";
import {envelope as env, plugin as p} from "@sugarcube/core";
import SheetsDo from "../sheets";
import {
  unitsToRows,
  concatRows,
  coerceSelectionLists,
  applyFilters,
} from "../utils";
import {assertCredentials, assertSpreadsheet, assertSheet} from "../assertions";

const querySource = "sheets_condition";

const moveData = async (envelope, {log, cfg, cache, stats}) => {
  const client = get("google.client_id", cfg);
  const secret = get("google.client_secret", cfg);
  const id = get("google.spreadsheet_id", cfg);
  const sheet = getOr("Sheet1", "google.sheet", cfg);
  const sheetFields = getOr([], "google.sheet_fields", cfg);
  const copyFromSheet = get("google.copy_from_sheet", cfg);
  const copyFromSpreadsheet = get("google.copy_from_spreadsheet", cfg);
  const skipEmpty = get("google.skip_empty", cfg);
  const toId = getOr(id, "google.to_spreadsheet_id", cfg);
  const toSheet = getOr(cfg.marker, "google.to_sheet", cfg);
  const selectionLists = coerceSelectionLists(
    get("google.selection_list", cfg),
  );
  const queries = env.queriesByType(querySource, envelope);
  const filters = queries.map(q => q.split(":"));

  if (copyFromSheet && !copyFromSpreadsheet) {
    throw new Error("Missing configuration: google.copy_from_spreadsheet");
  }
  if (copyFromSpreadsheet && !copyFromSheet) {
    throw new Error("Missing configuration: google.copy_from_sheet");
  }

  const [units, tokens, history] = await SheetsDo(
    function* moveUnits({
      getOrCreateSheet,
      duplicateSheet,
      getRows,
      deleteRows,
      replaceRows,
      safeReplaceRows,
      setSelections,
    }) {
      const rowsToMove = yield getRows(id, sheet);

      if (skipEmpty && rowsToMove.length < 2) {
        log.warn("No data to move. Skip the move.");
        return [];
      }

      const dataToMove = applyFilters(filters, rowsToMove);

      const {sheetUrl: targetUrl} = copyFromSheet
        ? yield duplicateSheet(
            copyFromSpreadsheet,
            copyFromSheet,
            toId,
            toSheet,
          )
        : yield getOrCreateSheet(toId, toSheet);
      const existingRows = yield getRows(toId, toSheet);

      log.info(`Moving ${rowsToMove.length} observations to ${targetUrl}.`);
      log.info(
        `Merging ${rowsToMove.length} observations into ${existingRows.length} observations.`,
      );
      stats.count("total", rowsToMove.length);
      stats.count("existing", existingRows.length);

      const mergedRows = flow([
        concatRows(existingRows),
        get("data"),
        unitsToRows(sheetFields),
      ])(dataToMove);

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
      yield setSelections(toId, toSheet, selectionLists);

      // Clean existing sheet.
      const idHashIndex = rowsToMove[0].indexOf("_sc_id_hash");
      const idsToMove = tail(dataToMove).map(r => r[idHashIndex]);
      const indexesToDelete = tail(rowsToMove).reduce(
        (memo, [idHash], index) => {
          if (idsToMove.find(i => i === idHash)) return memo.concat(index + 1);
          return memo;
        },
        [],
      );
      yield deleteRows(id, sheet, indexesToDelete);

      return mergedRows;
    },
    {client, secret, tokens: cache.get("sheets.tokens")},
  );

  history.forEach(([k, meta]) => log.debug(`${k}: ${JSON.stringify(meta)}.`));
  cache.update("sheets.tokens", merge(tokens));

  return env.concatData(units, envelope);
};

const plugin = p.liftManyA2([
  assertCredentials,
  assertSpreadsheet,
  assertSheet,
  moveData,
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
  "google.skip_empty": {
    type: "boolean",
    desc: "Skip export of empty data pipelines.",
  },
};

export default plugin;
