import {flow, merge, size, get, getOr} from "lodash/fp";
import {envelope as env, plugin as p} from "@sugarcube/core";
import SheetsDo from "../sheets";
import {rowsToUnits, applyFilters} from "../utils";
import {assertCredentials, assertSpreadsheet, assertSheet} from "../assertions";

const querySource = "sheets_condition";

const importData = async (envelope, {log, cfg, cache, stats}) => {
  const client = get("google.client_id", cfg);
  const secret = get("google.client_secret", cfg);
  const id = get("google.spreadsheet_id", cfg);
  const sheet = getOr("Sheet1", "google.sheet", cfg);
  const sheetFields = getOr([], "google.sheet_fields", cfg);
  const idFields = get("google.id_fields", cfg);
  const queries = env.queriesByType(querySource, envelope);
  const filters = queries.map((q) => q.split(":"));

  const [units, tokens, history] = await SheetsDo(
    function* importUnits({getRows}) {
      const rows = yield getRows(id, sheet);
      const data = flow([applyFilters(filters), rowsToUnits(sheetFields)])(
        rows,
      );
      if (idFields) return data.map(merge({_sc_id_fields: idFields}));
      return data;
    },
    {client, secret, tokens: cache.get("sheets.tokens")},
  );

  history.forEach(([k, meta]) => log.debug(`${k}: ${JSON.stringify(meta)}.`));
  cache.update("sheets.tokens", merge(tokens));

  log.info("Spreadsheet retrieved");
  log.info(`Updating ${size(units)} units from sheet`);
  stats.count("total", size(units));

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
