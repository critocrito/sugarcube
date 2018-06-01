import {flow, merge, size, get, getOr} from "lodash/fp";
import {envelope as env, plugin as p} from "@sugarcube/core";
import withSession from "../sheets";
import {unitsToRows, concatRows, coerceSelectionLists} from "../utils";
import {assertCredentials, assertSpreadsheet, assertSheet} from "../assertions";

const moveData = async (envelope, {log, cfg, cache}) => {
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

  if (copyFromSheet && !copyFromSpreadsheet) {
    throw new Error("Missing configuration: google.copy_from_spreadsheet");
  }
  if (copyFromSpreadsheet && !copyFromSheet) {
    throw new Error("Missing configuration: google.copy_from_sheet");
  }

  const [units, tokens] = await withSession(
    async ({
      getOrCreateSheet,
      duplicateSheet,
      getRows,
      replaceRows,
      safeReplaceRows,
      setSelection,
    }) => {
      const rowsToMove = await getRows(id, sheet);

      if (skipEmpty && rowsToMove.length < 2) {
        log.warn("No data to move. Skip the move.");
        return [];
      }

      const {sheetUrl: targetUrl} = await (copyFromSheet
        ? duplicateSheet(copyFromSpreadsheet, copyFromSheet, toId, toSheet)
        : getOrCreateSheet(toId, toSheet));
      const existingRows = await getRows(toId, toSheet);

      log.info(`Moving ${rowsToMove.length} observations to ${targetUrl}.`);
      log.info(
        `Merging ${rowsToMove.length} observations into ${existingRows.length} observations.`,
      );

      const mergedRows = flow([
        concatRows(existingRows),
        get("data"),
        unitsToRows(sheetFields),
      ])(rowsToMove);

      // No need to safely update data if the sheet is empty.
      if (size(existingRows) === 0) {
        await replaceRows(toId, toSheet, mergedRows);
      } else {
        const [, e] = await safeReplaceRows(toId, toSheet, mergedRows);
        if (e) {
          log.error(`Atomic data replace of target failed.`);
          log.error(`Backup sheet ${e.sheet} is located at ${e.sheetUrl}.`);
          throw e;
        }
      }

      // Clean existing sheet.
      const [, e] = await safeReplaceRows(id, sheet, rowsToMove.slice(0, 1));
      if (e) {
        log.error(`Atomic data replace of source failed.`);
        log.error(`Backup sheet ${e.sheet} is located at ${e.sheetUrl}.`);
        throw e;
      }

      await Promise.all(
        selectionLists.map(([field, inputs]) =>
          setSelection(id, sheet, field, inputs),
        ),
      );
      return mergedRows;
    },
    {client, secret, tokens: cache.get("sheets.tokens")},
  );

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
