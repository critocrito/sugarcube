import {curry, flow, get, getOr, size} from "lodash/fp";
import {retryP} from "dashp";
import {envelope as env, plugin as p} from "@sugarcube/core";
import withSession from "../sheets";
import {header, unitsToRows, rowsToUnits} from "../utils";
import {assertCredentials, assertSpreadsheet} from "../assertions";

const mergeUnitsAndRows = curry((units, rows) => {
  const data = rowsToUnits(header(rows), rows);
  return env.concat(env.envelopeData(data), env.envelopeData(units)).data;
});

const exportData = async (envelope, {log, cfg}) => {
  const client = get("google.client_id", cfg);
  const secret = get("google.client_secret", cfg);
  const refreshToken = get("google.refresh_token", cfg);
  const id = get("google.spreadsheet_id", cfg);
  const fields = getOr([], "google.sheet_fields", cfg);
  const copyFromSheet = get("google.copy_from_sheet", cfg);
  const copyFromSpreadsheet = get("google.copy_from_spreadsheet", cfg);
  const skipEmpty = get("google.skip_empty", cfg);
  const sheetName = getOr(cfg.marker, "google.sheet", cfg);

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

  await withSession(
    async ({
      getOrCreateSheet,
      duplicateSheet,
      createValues,
      getValues,
      clearValues,
    }) => {
      const {sheetId} = await (copyFromSheet
        ? duplicateSheet(copyFromSpreadsheet, copyFromSheet, id, sheetName)
        : getOrCreateSheet(id, sheetName));

      const url = `https://docs.google.com/spreadsheets/d/${id}/edit#gid=${sheetId}`;
      log.info(`Units exported to ${url}`);

      const rows = await getValues(id, sheetName);

      log.info(
        `Merging ${size(envelope.data)} new units and ${size(rows)}` +
          ` existing rows.`
      );

      const mergeEnvelope = flow([
        mergeUnitsAndRows(envelope.data),
        unitsToRows(fields),
      ]);
      // TODO: If clear succeeds, but create not, I lost all my data. retryP
      // is just a crutch here.
      await clearValues(id, sheetName);
      await retryP(createValues(id, sheetName, mergeEnvelope(rows)));
    },
    {client, secret, refreshToken}
  );

  return envelope;
};

const plugin = p.liftManyA2([assertCredentials, assertSpreadsheet, exportData]);

plugin.desc = "Export SugarCube data to a google spreadsheet.";

plugin.argv = {
  "google.copy_from_sheet": {
    type: "text",
    desc: "Duplicate this sheet before exporting to the copy.",
  },
  "google.copy_from_spreadsheet": {
    type: "text",
    desc: "Duplicate a sheet from this spreadsheet ID.",
  },
  "google.skip_empty": {
    type: "boolean",
    desc: "Skip export of empty data pipelines.",
  },
};

export default plugin;
