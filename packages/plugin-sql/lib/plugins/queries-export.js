import {get, pick} from "lodash/fp";
import {utils as u} from "@sugarcube/core";

import {connectPostgres, connectSqlite} from "../db";
import {flattenObj} from "../utils";

const plugin = async (envelope, {cfg, log, stats}) => {
  const debug = get("sql.debug", cfg);
  const engine = get("sql.engine", cfg);
  const database = get("sql.database", cfg);
  const host = get("sql.host", cfg);
  const port = get("sql.port", cfg);
  const user = get("sql.user", cfg);
  const password = get("sql.password", cfg);
  const queryFields = u.sToA(",", get("sql.query_fields", cfg));

  const total = envelope.queries.length;

  stats.count("total", total);
  log.info(`Exporting ${total} queries.`);

  let db;
  if (engine === "postgres")
    db = connectPostgres({database, host, port, user, password, debug});
  if (engine === "sqlite")
    db = connectSqlite(
      {database: database === "sugarcube" ? `${database}.db` : database, debug},
      log,
    );

  // Fix the format of queries to use the new tags field.
  const queries = envelope.queries.map(({type, term, tags = [], ...rest}) => {
    const data = flattenObj(rest);

    return {
      type,
      term,
      tags: Object.keys(
        queryFields.length === 0 ? rest : pick(queryFields, data),
      )
        .reduce((memo, key) => {
          if (data[key] == null || data[key] === "") return memo;
          return memo.concat([{name: key, value: data[key]}]);
        }, [])
        .concat(tags),
    };
  });

  const errors = await db.queries.create(queries);

  db.close();

  errors.forEach(({reason, type, term}) => {
    stats.fail({type, term, reason});
    log.error(`Query ${type}/${term} failed to export: ${reason}`);
  });

  const success = queries.length - errors.length;
  stats.count("success", success);
  log.info(`Exported ${success} queries`);

  return envelope;
};

plugin.argv = {};
plugin.desc = "Export queries into a database.";

export default plugin;
