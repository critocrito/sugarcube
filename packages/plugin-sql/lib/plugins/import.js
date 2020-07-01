import {get} from "lodash/fp";
import {envelope as env} from "@sugarcube/core";

import {connectPostgres, connectSqlite} from "../db";

const plugin = async (envelope, {cfg, log}) => {
  const debug = get("sql.debug", cfg);
  const engine = get("sql.engine", cfg);
  const database = get("sql.database", cfg);
  const host = get("sql.host", cfg);
  const port = get("sql.port", cfg);
  const user = get("sql.user", cfg);
  const password = get("sql.password", cfg);

  let db;
  if (engine === "postgres")
    db = connectPostgres({database, host, port, user, password, debug});
  if (engine === "sqlite")
    db = connectSqlite(
      {database: database === "sugarcube" ? `${database}.db` : database, debug},
      log,
    );

  const units = await db.units.listAll();

  log.info(`Fetched ${units.length} units from the database.`);

  db.close();

  return env.concatData(units, envelope);
};

plugin.argv = {};
plugin.desc = "Import data into the pipeline.";

export default plugin;
