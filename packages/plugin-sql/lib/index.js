import {
  flow,
  keys,
  intersection,
  pick,
  forEach,
  merge,
  values,
} from "lodash/fp";
import {plugin} from "@sugarcube/core";

import schemaMigrate from "./plugins/schema-migrate";
import queriesExport from "./plugins/queries-export";
import queriesImport from "./plugins/queries-import";
import unitsImport from "./plugins/import";
import unitsExport from "./plugins/export";
import instrument from "./instruments/instrument";
import {assertCfgOptions} from "./assertions";

import {connectPostgres, connectSqlite} from "./db";

const {liftManyA2} = plugin;

const assertEngine = assertCfgOptions("sql.engine", ["sqlite", "postgres"]);

export const plugins = {
  sql_schema_migrate: liftManyA2([assertEngine, schemaMigrate]),
  sql_queries_export: liftManyA2([assertEngine, queriesExport]),
  sql_queries_import: liftManyA2([assertEngine, queriesImport]),
  sql_import: liftManyA2([assertEngine, unitsImport]),
  sql_export: liftManyA2([assertEngine, unitsExport]),
};

export const instruments = {
  sql_instrument: instrument,
};

const queryPlugins = flow([
  keys,
  intersection(["sql_queries_export", "sql_queries_import"]),
  ps => pick(ps, plugins),
  values,
])(plugins);

// Arguments common to all plugins.
forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "sql.debug": {
        type: "boolean",
        default: "false",
        desc: "Enable tracing mode. Prints verbose debugging information.",
      },
      "sql.engine": {
        type: "string",
        nargs: 1,
        default: "sqlite",
        desc: "The database engine to use. Can be either postgres or sqlite.",
      },
      "sql.database": {
        type: "string",
        nargs: 1,
        default: "sugarcube",
        desc:
          "The name of the database. If the engine is sqlite specify the path to the database file.",
      },
      "sql.host": {
        type: "string",
        nargs: 1,
        default: "localhost",
        desc:
          "The host name of the database server. Only valid if the engine isn't sqlite.",
      },
      "sql.port": {
        type: "number",
        nargs: 1,
        default: 5432,
        desc:
          "The port of the database server. Only valid if the engine isn't sqlite.",
      },
      "sql.user": {
        type: "string",
        nargs: 1,
        desc:
          "The user of the database. Only valid if the engine isn't sqlite.",
      },
      "sql.password": {
        type: "string",
        nargs: 1,
        desc:
          "The password of the database. Only valid if the engine isn't sqlite.",
      },
    },
    p.argv,
  );
}, values(plugins));

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "sql.query_fields": {
        type: "array",
        default: [],
        desc: "Extra fields to when importing and exporting queries.",
      },
    },
    p.argv,
  );
}, queryPlugins);

export default {plugins, instruments, connectSqlite, connectPostgres};
