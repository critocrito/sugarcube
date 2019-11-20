# `@sugarcube/plugin-sql`

Use a SQL database as a data persistence store for Sugarcube. Supports PostgreSQL and SQLite.

## Installation

```shell
npm install --save @sugarcube/plugin-sql
```

## Plugins

### `sql_queries_import`

Import queries for a certain type from a SQL database. The query type is `query_type`.

**Example:**

```shell
$(npm bin)/sugarcube -p sql_queries_import,youtube_video \
                     -Q query_type:youtube_video \
                     --sql.database path/to/project.db
```

**Configuration:**

- `sql.engine`: Select the type of database you want to connect to. Possible options are `sqlite` and `postgres`. Defaults to `sqlite`.
- `sql.database`: Set the name of the database to use. If the selected database engine is `sqlite` this is the path to the database file. Defaults to `sugarcube.db` for `sqlite` and otherwise to `sugarcube`.
- `sql.host`: If the selected database engine is `postgres` specify the hostname of the database server. This setting is ignored for the `sqlite` engine. Defaults to `localhost`.
- `sql.port`: If the selectec database engine is `postgres` specify the port of the database server. This setting is ignored for the `sqlite` engine. Defaults to `5432`.
- `sql.user`: The name of the database user account. This setting is ignored for the `sqlite` engine.
- `sql.password`: The password for the database user. This setting is ignored for the `sqlite` engine.
- `sql.debug`: Enable the tracing mode for the database engine. If set to `true` print all queries that are issued to the database. This is useful for development. Defaults to `false`.
- `sql.query_fields`: Specify an array of annotations that should be imported and exported with queries. Defaults to `[]` which means to import all available annotations.

### `sql_queries_export`

Export queries into a SQL database.

**Example:**

```shell
$(npm bin)/sugarcube -p sql_queries_import,youtube_video,sql_queries_export \
                     -Q query_type:youtube_video \
                     --sql.database path/to/project.db
```

**Configuration:**

- `sql.engine`: Select the type of database you want to connect to. Possible options are `sqlite` and `postgres`. Defaults to `sqlite`.
- `sql.database`: Set the name of the database to use. If the selected database engine is `sqlite` this is the path to the database file. Defaults to `sugarcube.db` for `sqlite` and otherwise to `sugarcube`.
- `sql.host`: If the selected database engine is `postgres` specify the hostname of the database server. This setting is ignored for the `sqlite` engine. Defaults to `localhost`.
- `sql.port`: If the selectec database engine is `postgres` specify the port of the database server. This setting is ignored for the `sqlite` engine. Defaults to `5432`.
- `sql.user`: The name of the database user account. This setting is ignored for the `sqlite` engine.
- `sql.password`: The password for the database user. This setting is ignored for the `sqlite` engine.
- `sql.debug`: Enable the tracing mode for the database engine. If set to `true` print all queries that are issued to the database. This is useful for development. Defaults to `false`.
- `sql.query_fields`: Specify an array of annotations that should be imported and exported with queries. Defaults to `[]` which means to import all available annotations.

### `sql_schema_migrate`

Migrate the database schema. Run this plugin whenever a migration is required. It is safe to run this plugin wven though no new migration is available.

**Example:**

```shell
$(npm bin)/sugarcube -p sql_schema_migrate --sql.database path/to/project.db
```

**Configuration:**

- `sql.engine`: Select the type of database you want to connect to. Possible options are `sqlite` and `postgres`. Defaults to `sqlite`.
- `sql.database`: Set the name of the database to use. If the selected database engine is `sqlite` this is the path to the database file. Defaults to `sugarcube.db` for `sqlite` and otherwise to `sugarcube`.
- `sql.host`: If the selected database engine is `postgres` specify the hostname of the database server. This setting is ignored for the `sqlite` engine. Defaults to `localhost`.
- `sql.port`: If the selectec database engine is `postgres` specify the port of the database server. This setting is ignored for the `sqlite` engine. Defaults to `5432`.
- `sql.user`: The name of the database user account. This setting is ignored for the `sqlite` engine.
- `sql.password`: The password for the database user. This setting is ignored for the `sqlite` engine.
- `sql.debug`: Enable the tracing mode for the database engine. If set to `true` print all queries that are issued to the database. This is useful for development. Defaults to `false`.
