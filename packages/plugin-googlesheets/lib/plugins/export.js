import {flow, merge, get, getOr, size} from "lodash/fp";
import {plugin as p, utils} from "@sugarcube/core";
import SheetsDo from "../sheets";
import {
  unitsToRows,
  concatEnvelopeAndRows,
  coerceSelectionLists,
} from "../utils";
import {assertCredentials, assertSpreadsheet} from "../assertions";

const exportData = async (envelope, {log, cfg, cache}) => {
  const client = get("google.client_id", cfg);
  const secret = get("google.client_secret", cfg);
  const id = get("google.spreadsheet_id", cfg);
  const fields = getOr([], "google.sheet_fields", cfg);
  const copyFromSheets = utils.sToA(",", get("google.copy_from_sheet", cfg));
  const copyFromSpreadsheet = get("google.copy_from_spreadsheet", cfg);
  const skipEmpty = get("google.skip_empty", cfg);
  const sheets = utils.sToA(",", getOr(cfg.marker, "google.sheet", cfg));
  const selectionLists = coerceSelectionLists(
    get("google.selection_list", cfg),
  );

  // We treat the first sheet as the sheet to export data to.
  const [sheet] = sheets;
  const [copyFromSheet] = copyFromSheets;

  if (skipEmpty && size(envelope.data) === 0) {
    log.info("Data pipeline is empty. Skip the export.");
    return envelope;
  }

  if (copyFromSheet && !copyFromSpreadsheet) {
    throw new Error("Missing configuration: google.copy_from_spreadsheet");
  }
  if (copyFromSpreadsheet && !copyFromSheet) {
    throw new Error("Missing configuration: google.copy_from_sheet");
  }

  const [, tokens, history] = await SheetsDo(
    function* exportUnits({
      getOrCreateSheet,
      duplicateSheets,
      getRows,
      replaceRows,
      safeReplaceRows,
      setSelections,
    }) {
      let url;
      if (copyFromSheet == null) {
        const newSheet = yield getOrCreateSheet(id, sheet);
        url = newSheet.sheetUrl;
      } else {
        const duplicates = yield duplicateSheets(
          copyFromSpreadsheet,
          copyFromSheets,
          id,
          sheets,
        );
        // The first one is the actual data spreadsheet.
        url = duplicates[0].sheetUrl;
      }

      log.info(`Units exported to ${url}.`);

      const rows = yield getRows(id, sheet);

      log.info(
        `Merging ${size(envelope.data)} into ${size(rows.slice(1))} units.`,
      );

      const mergedRows = flow([
        concatEnvelopeAndRows(envelope),
        get("data"),
        unitsToRows(fields),
      ])(rows);

      // No need to safely update data if the sheet is empty.
      if (size(rows) === 0) {
        yield replaceRows(id, sheet, mergedRows);
      } else {
        const [, e] = yield safeReplaceRows(id, sheet, mergedRows);
        if (e) {
          log.error(`Atomic data export failed.`);
          log.error(`Backup sheet ${e.sheet} is located at ${e.sheetUrl}.`);
          throw e;
        }
      }
      yield setSelections(id, sheet, selectionLists);
    },
    {client, secret, tokens: cache.get("sheets.tokens")},
  );

  history.forEach(([k, meta]) => log.debug(`${k}: ${JSON.stringify(meta)}.`));
  cache.update("sheets.tokens", merge(tokens));

  return envelope;
};

const plugin = p.liftManyA2([assertCredentials, assertSpreadsheet, exportData]);

plugin.desc = "Export SugarCube data to a google spreadsheet.";

plugin.argv = {
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
