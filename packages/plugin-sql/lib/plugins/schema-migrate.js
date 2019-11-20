import {get} from "lodash/fp";
import marv from "marv/api/promise";
import pgDriver from "marv-pg-driver";
import sqliteDriver from "@open-fidias/marv-better-sqlite3-driver";
import path from "path";

const plugin = async (envelope, {log, cfg}) => {
  const engine = get("sql.engine", cfg);
  const database = get("sql.database", cfg);
  const host = get("sql.host", cfg);
  const port = get("sql.port", cfg);
  const user = get("sql.user", cfg);
  const password = get("sql.password", cfg);

  const directory = path.join(__dirname, `../../migrations/${engine}/`);
  const driver =
    engine === "postgres"
      ? pgDriver({
          connection: {
            host,
            port,
            database,
            user,
            password,
          },
        })
      : sqliteDriver({
          connection: {
            path: database === "sugarcube" ? `${database}.db` : database,
          },
        });

  log.info(`Scanning ${directory} for migrations`);

  const migrations = await marv.scan(directory);
  await marv.migrate(migrations, driver);

  return envelope;
};

plugin.desc = "Migrate the SQL schema.";

plugin.argv = {};

export default plugin;
