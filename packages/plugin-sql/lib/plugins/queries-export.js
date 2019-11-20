import {get} from "lodash/fp";
import {utils as u} from "@sugarcube/core";

import {connectPostgres, connectSqlite} from "../db";

const plugin = async (envelope, {cfg, log}) => {
  const debug = get("sql.debug", cfg);
  const engine = get("sql.engine", cfg);
  const database = get("sql.database", cfg);
  const host = get("sql.host", cfg);
  const port = get("sql.port", cfg);
  const user = get("sql.user", cfg);
  const password = get("sql.password", cfg);
  const queryFields = u.sToA(",", get("sql.query_fields", cfg));

  log.info(`Exporting ${envelope.queries.length} queries.`);

  let db;
  if (engine === "postgres")
    db = connectPostgres({database, host, port, user, password, debug});
  if (engine === "sqlite")
    db = connectSqlite(
      {database: database === "sugarcube" ? `${database}.db` : database, debug},
      log,
    );

  await db.queries.create(envelope.queries, queryFields);

  db.close();

  return envelope;
};

plugin.argv = {};
plugin.desc = "Export queries into a database.";

export default plugin;
