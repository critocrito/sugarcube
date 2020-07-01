import {get} from "lodash/fp";

import {connectPostgres, connectSqlite} from "../db";

const plugin = async (envelope, {cfg, log, stats}) => {
  const debug = get("sql.debug", cfg);
  const engine = get("sql.engine", cfg);
  const database = get("sql.database", cfg);
  const host = get("sql.host", cfg);
  const port = get("sql.port", cfg);
  const user = get("sql.user", cfg);
  const password = get("sql.password", cfg);

  const total = envelope.data.length;

  stats.count("total", total);
  log.info(`Exporting ${total} data.`);

  let db;
  if (engine === "postgres")
    db = connectPostgres({database, host, port, user, password, debug});
  if (engine === "sqlite")
    db = connectSqlite(
      {database: database === "sugarcube" ? `${database}.db` : database, debug},
      log,
    );

  let newCnt = 0;
  let existingCnt = 0;
  let successCnt = 0;

  for (const unit of envelope.data) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const existing = await db.units.create(unit);

      successCnt += 1;
      if (existing) {
        existingCnt += 1;
      } else {
        newCnt += 1;
      }
    } catch (e) {
      const type = unit._sc_source;
      const term = unit._sc_id_hash;
      const reason = e.message;

      stats.fail({type, term, reason});
      log.error(`Unit ${type}/${term} failed to export: ${reason}`);
      log.debug(e);
    }
  }

  db.close();

  stats.count("success", successCnt);
  stats.count("new", newCnt);
  stats.count("existing", existingCnt);

  log.info(`${newCnt} units were new and ${existingCnt} were existing before.`);

  return envelope;
};

plugin.argv = {};
plugin.desc = "Export data into a database.";

export default plugin;
