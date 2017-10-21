import {get, getOr} from "lodash/fp";
import withSession from "../sheets";
import {unitsToValues} from "../utils";

const plugin = async (envelope, {log, cfg}) => {
  const client = get("google.client_id", cfg);
  const secret = get("google.client_secret", cfg);
  const project = get("google.project_id", cfg);
  const token = get("google.token", cfg);
  const id = get("google.spreadsheet_id", cfg);
  const fields = getOr([], "google.sheet_fields", cfg);
  const copyFromSheet = get("google.copy_from_sheet", cfg);
  const copyFromSpreadsheet = getOr(id, "google.copy_from_spreadsheet", cfg);
  const sheetName = getOr(cfg.marker, "google.sheet", cfg);

  if (copyFromSheet && !copyFromSpreadsheet) {
    throw new Error("Missing configuration: google.copy_from_spreadsheet");
  }
  if (copyFromSpreadsheet && !copyFromSheet) {
    throw new Error("Missing configuration: google.copy_from_sheet");
  }

  const url = await withSession(
    async ({getOrCreateSheet, duplicateSheet, createValues}) => {
      const {sheetId} = await (copyFromSheet
        ? duplicateSheet(copyFromSpreadsheet, copyFromSheet, id, sheetName)
        : getOrCreateSheet(id, sheetName));
      await createValues(id, sheetName, unitsToValues(fields, envelope.data));
      return `https://docs.google.com/spreadsheets/d/${id}/edit#gid=${sheetId}`;
    },
    {client, secret, project, token}
  );

  log.info(`Units exported to ${url}`);

  return envelope;
};

plugin.desc = "Export SugarCube data to a google spreadsheet.";

plugin.argv = {
  "google.copy_from_sheet": {
    type: "text",
    desc: "Duplicate this sheet before exporting to the copy.",
  },
  "google.copy_from_spreadsheet": {
    type: "text",
    desc:
      "Duplicate a sheet from this spreadsheet ID. Default: current spreadsheet ID.",
  },
};

export default plugin;
