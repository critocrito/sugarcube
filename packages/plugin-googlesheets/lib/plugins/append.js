import {merge, get, getOr, size} from "lodash/fp";
import {plugin as p} from "@sugarcube/core";
import SheetsDo from "../sheets";
import {unitsToRows, coerceSelectionLists} from "../utils";
import {assertCredentials, assertSpreadsheet} from "../assertions";

const exportData = async (envelope, {log, cfg, cache}) => {
  const client = get("google.client_id", cfg);
  const secret = get("google.client_secret", cfg);
  const id = get("google.spreadsheet_id", cfg);
  const fields = getOr([], "google.sheet_fields", cfg);
  const copyFromSheet = get("google.copy_from_sheet", cfg);
  const copyFromSpreadsheet = get("google.copy_from_spreadsheet", cfg);
  const skipEmpty = get("google.skip_empty", cfg);
  const sheet = getOr(cfg.marker, "google.sheet", cfg);
  const selectionLists = coerceSelectionLists(
    get("google.selection_list", cfg),
  );

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
    function* appendUnits({
      getOrCreateSheet,
      duplicateSheet,
      appendRows,
      getRows,
      setSelections,
    }) {
      const {sheetUrl} = yield copyFromSheet
        ? duplicateSheet(copyFromSpreadsheet, copyFromSheet, id, sheet)
        : getOrCreateSheet(id, sheet);

      const rows = yield getRows(id, sheet);
      const hasHeader = size(rows) > 0;
      const data = unitsToRows(fields, envelope.data);
      const dataNoHeader = data.slice(1);

      const {updatedRange: range} = yield appendRows(
        id,
        sheet,
        hasHeader ? data.slice(1) : data,
      );

      yield setSelections(id, sheet, selectionLists);

      log.info(`Appended ${size(dataNoHeader)} units to ${sheetUrl}.`);
      log.info(`Updated range ${range.replace(/^.*!/, "")} of ${sheet}.`);
    },
    {client, secret, tokens: cache.get("sheets.tokens")},
  );

  history.forEach(([k, meta]) => log.debug(`${k}: ${JSON.stringify(meta)}.`));
  cache.update("sheets.tokens", merge(tokens));

  return envelope;
};

const plugin = p.liftManyA2([assertCredentials, assertSpreadsheet, exportData]);

plugin.desc = "Append SugarCube data to a google spreadsheet.";

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
    desc: "Skip append of empty data pipelines.",
  },
};

export default plugin;
