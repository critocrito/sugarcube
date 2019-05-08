# @sugarcube/plugin-mongodb

This is a plugin for [sugarcube](https://gitlab.com/sugarcube/sugarcube).

Persists profile, history and unit data in mongodb.

## Installation

```
npm install --save @sugarcube/plugin-mongodb
```

## Plugins

### `mongodb_store` plugin

```
$(npm bin)/sugarcube -q queries.json -c config.json -p twitter_feed,mongodb_store
```

Store all data units in a mongodb database. It differentiates new units,
revisions and relations.

**Configuration:**

- `mongodb.uri`: The database connection string (defaults to `mongodb://localhost/sugarcube`).

### `mongodb_query_units` plugin

Fetch all units based on a MongoDB query string. The query string is defined
as a SugarCube query, e.g.:

```
[{
  "type": "mongodb_query_units",
  "term": {}
}, {
  "type": "mongodb_query_units",
  "term": {"_sc_source": "twitter_feed"}
}, {
  "type": "mongodb_query_units",
  "term": {"_sc_markers": {"$elemMatch": {"$in": ["BJUwmvnsg", "S14uPDnog"]}}}
}]
```

**Configuration:**

- `mongodb.uri`: The database connection string (defaults to `mongodb://localhost/sugarcube`).

### `mongodb_fetch_units` plugin

Fetch units by `_sc_id_hash` from the database. Supply the query type
`mongodb_unit` that specifies the id hash of the unit.

```
sugarcube -d -Q mongodb_unit:06b11b54d8c7c62af2c058d8c1f814cac5415bf149b790d447f0b34280f625d6 -p mongodb_fetch_units,tap_printf
```

**Configuration:**

- `mongodb.uri`: The database connection string (defaults to `mongodb://localhost/sugarcube`).

### `mongodb_fetch_relations` plugin

Fetch relations by `_sc_id_hash` from the database. Supply the query type
`mongodb_relation` that specifes the id hash.

**Configuration:**

- `mongodb.uri`: The database connection string (defaults to `mongodb://localhost/sugarcube`).

### `mongodb_fetch_revisions` plugin

Fetch revisions of units by `_sc_id_hash` from the database. Supply the query
type `mongodb_unit` that specifies the id hash of the unit.

**Configuration:**

- `mongodb.uri`: The database connection string (defaults to `mongodb://localhost/sugarcube`).

### `mongodb_complement` plugin

Complement data in the pipeline, with data that is already stored in the
database. This allows to enhance data, with already stored data. Data stored
in the database takes precedence.

### `mongodb_supplement` plugin

Like `mongodb_complement`, but data in the pipeline takes precedence over data
stored in the database.

**Configuration:**

- `mongodb.uri`: The database connection string (defaults to `mongodb://localhost/sugarcube`).

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
