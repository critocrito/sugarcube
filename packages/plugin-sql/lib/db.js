import fs from "fs";
import path from "path";
import {camelCase} from "lodash/fp";
import pgPromise, {QueryFile} from "pg-promise";
import monitor from "pg-monitor";
import Database from "better-sqlite3";

import QueriesPostgres from "./postgres/queries";
import UnitsPostgres from "./postgres/units";
import QueriesSqlite from "./sqlite/queries";
import UnitsSqlite from "./sqlite/units";

const sql = (engine, repo) => {
  const queries = {};
  const dir = path.join(__dirname, "../sql", engine, repo);

  fs.readdirSync(dir)
    .filter(file => /\.sql$/.test(file))
    .forEach(file => {
      const queryName = `${camelCase(path.basename(file, ".sql"))}Query`;
      if (engine === "sqlite")
        queries[queryName] = fs.readFileSync(path.join(dir, file)).toString();
      if (engine === "postgres") {
        const qf = new QueryFile(path.join(dir, file), {
          minify: true,
          compress: true,
        });
        if (qf.error) {
          throw new Error(qf.error);
        }
        queries[queryName] = qf;
      }
    });

  return queries;
};

// I load the query files for postgres here to avoid duplicate query file creation.
const pgQueries = {
  queries: sql("postgres", "queries"),
  units: sql("postgres", "units"),
};

let pgp;

const initOptions = {
  capSQL: true,

  // eslint-disable-next-line no-unused-vars
  extend(obj, dc) {
    // eslint-disable-next-line no-param-reassign
    obj.queries = new QueriesPostgres(obj, pgp, pgQueries.queries);
    // eslint-disable-next-line no-param-reassign
    obj.units = new UnitsPostgres(obj, pgp, pgQueries.units, {
      queriesStore: new QueriesPostgres(obj, pgp, pgQueries.queries),
    });
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
  db.pragma("foreign_keys = ON");

  const queriesStore = new QueriesSqlite(db, sql("sqlite", "queries"));

  return {
    queries: queriesStore,
    units: new UnitsSqlite(db, sql("sqlite", "units"), {queriesStore}),
    checkpoint: () => db.checkpoint(),
    close: () => {
      db.checkpoint();
      db.close();
    },
  };
};
