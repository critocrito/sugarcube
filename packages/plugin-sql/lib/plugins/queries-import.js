import {get} from "lodash/fp";
import {flatmapP} from "dashp";
import {envelope as env} from "@sugarcube/core";

import {connectPostgres, connectSqlite} from "../db";

const querySource = "query_type";

const plugin = async (envelope, {cfg, log, stats}) => {
  const debug = get("sql.debug", cfg);
  const engine = get("sql.engine", cfg);
  const database = get("sql.database", cfg);
  const host = get("sql.host", cfg);
  const port = get("sql.port", cfg);
  const user = get("sql.user", cfg);
  const password = get("sql.password", cfg);

  const queriesByType = env.queriesByType(querySource, envelope);

  let db;
  if (engine === "postgres")
    db = connectPostgres({database, host, port, user, password, debug});
  if (engine === "sqlite")
    db = connectSqlite(
      {database: database === "sugarcube" ? `${database}.db` : database, debug},
      log,
    );

  const queries =
    queriesByType.length === 0
      ? await db.queries.listAll()
      : await flatmapP(async queryType => {
          const qs = await db.queries.listByType(queryType);

          log.info(`Importing ${qs.length} queries of type '${queryType}'.`);

          // we merge the tags into the query object itself for backwards compatibility.
          return qs;
        }, queriesByType);

  stats.count("queries", queries.length);

  db.close();

  return env.concatQueries(queries, envelope);
};

plugin.argv = {};
plugin.desc = "Import queries into the pipeline.";

export default plugin;
