import {merge, size, get, getOr} from "lodash/fp";
import {envelope as env, plugin as p} from "@sugarcube/core";
import withSession from "../sheets";
import {rowsToUnits} from "../utils";
import {assertCredentials, assertSpreadsheet, assertSheet} from "../assertions";

const importData = async (envelope, {log, cfg}) => {
  const client = get("google.client_id", cfg);
  const secret = get("google.client_secret", cfg);
  const refreshToken = get("google.refresh_token", cfg);
  const id = get("google.spreadsheet_id", cfg);
  const sheet = getOr("Sheet1", "google.sheet", cfg);
  const sheetFields = getOr([], "google.sheet_fields", cfg);
  const idFields = get("google.id_fields", cfg);

  const units = await withSession(
    async ({getValues}) => {
      const rows = await getValues(id, sheet);
      const data = rowsToUnits(sheetFields, rows);
      if (idFields) return data.map(merge({_sc_id_fields: idFields}));
      return data;
    },
    {client, secret, refreshToken}
  );

  log.info("Spreadsheet retrieved");
  log.info(`Updating ${size(units)} units from sheet`);

  return env.concatData(units, envelope);
};

const plugin = p.liftManyA2([
  assertCredentials,
  assertSpreadsheet,
  assertSheet,
  importData,
]);

plugin.desc = "Import SugarCube data from a google spreadsheet";

plugin.argv = {
  "google.id_fields": {
    type: "array",
    nargs: 1,
    desc: "Specify the id fields. Use multiple times to specify more fields.",
  },
};

export default plugin;
