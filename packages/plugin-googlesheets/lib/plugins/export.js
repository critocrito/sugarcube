import {curry, flow, merge, get, getOr, size} from "lodash/fp";
import {envelope as env, plugin as p} from "@sugarcube/core";
import withSession from "../sheets";
import {header, unitsToRows, rowsToUnits} from "../utils";
import {assertCredentials, assertSpreadsheet} from "../assertions";

const mergeUnitsAndRows = curry((units, rows) => {
  const data = rowsToUnits(header(rows), rows);
  return env.concat(env.envelopeData(data), env.envelopeData(units)).data;
});

const exportData = async (envelope, {log, cfg, cache}) => {
  const client = get("google.client_id", cfg);
  const secret = get("google.client_secret", cfg);
  const id = get("google.spreadsheet_id", cfg);
  const fields = getOr([], "google.sheet_fields", cfg);
  const copyFromSheet = get("google.copy_from_sheet", cfg);
  const copyFromSpreadsheet = get("google.copy_from_spreadsheet", cfg);
  const skipEmpty = get("google.skip_empty", cfg);
  const sheet = getOr(cfg.marker, "google.sheet", cfg);

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

  const [, tokens] = await withSession(
    async ({
      getOrCreateSheet,
      duplicateSheet,
      deleteSheet,
      createRows,
      getRows,
      clearRows,
    }) => {
      const {sheetUrl: url} = await (copyFromSheet
        ? duplicateSheet(copyFromSpreadsheet, copyFromSheet, id, sheet)
        : getOrCreateSheet(id, sheet));

      log.info(`Units exported to ${url}.`);

      const rows = await getRows(id, sheet);

      log.info(
        `Merging ${size(envelope.data)} into ${size(rows.slice(1))} units.`
      );

      const mergedRows = flow([
        mergeUnitsAndRows(envelope.data),
        unitsToRows(fields),
      ])(rows);

      // No need to safely update data if the sheet is empty.
      if (size(rows) === 0) {
        await createRows(id, sheet, mergedRows);
      } else {
        // To be safe not to loose any data, we make first a backup copy and
        // delete it after we exported the new data.
        const bkpSheet = `${sheet}-bkp`;
        const {sheetUrl} = await duplicateSheet(id, sheet, id, bkpSheet);
        try {
          await clearRows(id, sheet);
          await createRows(id, sheet, mergedRows);
          await deleteSheet(id, bkpSheet);
        } catch (e) {
          log.error(`Atomic data export failed.`);
          log.error(`Backup sheet ${bkpSheet} is located at ${sheetUrl}.`);
          throw e;
        }
      }
    },
    {client, secret, tokens: cache.get("sheets.tokens")}
  );

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
