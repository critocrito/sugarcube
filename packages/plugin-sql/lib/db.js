import fs from "fs";
import path from "path";
import {camelCase} from "lodash/fp";
import pgPromise, {QueryFile} from "pg-promise";
import monitor from "pg-monitor";
import Database from "better-sqlite3";

import QueriesPostgres from "./postgres/queries";
import QueriesSqlite from "./sqlite/queries";

const sql = engine => repo => {
  const queries = {};
  const dir = path.join(__dirname, "../sql", engine, repo);

  fs.readdirSync(dir)
    .filter(file => /\.sql$/.test(file))
    .forEach(file => {
      const queryName = `${camelCase(path.basename(file, ".sql"))}Query`;
      if (engine === "sqlite")
        queries[queryName] = fs.readFileSync(path.join(dir, file)).toString();
      if (engine === "postgres")
        queries[queryName] = new QueryFile(path.join(dir, file));
    });

  return queries;
};

const sqlSqlite = sql("sqlite");
const sqlPostgres = sql("postgres");

let pgp;

const initOptions = {
  capSQL: true,

  // eslint-disable-next-line no-unused-vars
  extend(obj, dc) {
    // eslint-disable-next-line no-param-reassign
    obj.queries = new QueriesPostgres(obj, pgp, sqlPostgres("queries"));
    // eslint-disable-next-line no-param-reassign
    obj.close = () => pgp.end();
  },
};

export const connectPostgres = ({debug, ...config}) => {
  pgp = pgPromise(initOptions);
  const db = pgp(config);
  if (debug) monitor.attach(initOptions);
  return db;
};

export const connectSqlite = ({debug, database}, log) => {
  const db = new Database(database, debug ? {verbose: log.debug} : {});

  return {
    queries: new QueriesSqlite(db, sqlSqlite("queries")),
    close: () => db.close(),
  };
};
