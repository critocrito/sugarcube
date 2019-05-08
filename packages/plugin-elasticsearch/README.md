# `@sugarcube/plugin-elasticsearch`

Use [Elasticsearch](https://www.elastic.co/products/elasticsearch) for
SugarCube data.

## Installation

```
npm install --save @sugarcube/plugin-elasticsearch
```

## Plugins

### `elastic_export` plugin

Store data of the current envelope in Elasticsearch.

**Configuration Options:**

- `elastic.host`: Set the hostname of the Elasticsearch server. Defaults to
  `localhost`.
- `elastic.port`: Set the port of the Elasticsearch server. Defaults to
  `9200`.
- `elastic.index`: Define the prefix to be used for index names. Defaults to
  `sugarcube`.
- `elastic.omit_fields`: Omit those fields from being stored in
  Elasticsearch. Define multiple fields by separating them with a comma.
- `elastic.mappings`: Supply a path to a JSON file that contains custom mapping definitions. Those custom mappings are merged into the default mappings, which can be found in [`./src/mappings.js`](./src/mappings.js).

**Example:**

```
sugarcube -Q ddg_search:Keith\ Johnstone -p ddg_search,elastic_export
```

To use custom mapping, write your mappings in a JSON file:

```sh
cat << EOF > mappings.json
{
  "cities": {"type": "nested"}
}
EOF
```

```
sugarcube -Q ddg_search:Keith\ Johnstone \
          -p ddg_search,elastic_export \
          --elastic.index dancers \
          --elastic.mappings mappings.json
```

Indexes are created the first time an export happens. In order to change the mappings of an existing index see [this](https://www.elastic.co/blog/changing-mapping-with-zero-downtime), [this](https://www.elastic.co/blog/reindex-is-coming) and [this](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-reindex.html).

### `elastic_import` plugin

Search for units in Elasticsearch and import them into the pipeline. Search
bodies can be defined in JSON files and imported using the `glob_pattern`
query type or supplied directly using the `elastic_query` source type. All
search bodies are regular Elasticsearch [request
bodies](https://www.elastic.co/guide/en/elasticsearch/reference/6.2/search-request-body.html)
and use the [Elasticsearch query
DSL](https://www.elastic.co/guide/en/elasticsearch/reference/6.2/query-dsl.html). See
[`queries.md`](./queries.md) for more examples.

**Configuration Options:**

- `elastic.host`: Set the hostname of the Elasticsearch server. Defaults to
  `localhost`.
- `elastic.port`: Set the port of the Elasticsearch server. Defaults to
  `9200`.
- `elastic.index`: Define the prefix to be used for index names. Defaults to
  `sugarcube`.
- `elastic.amount`: Set the maximum numbers of units to import. Defaults to
  `1000`.
- `elastic.include_fields`: Only fetch the fields specified. Defaults to fetch
  all fields. `_sc_id_hash` and `_sc_content_hash` are always fetched and
  don't need to be specified when using this option.

**Example:**

The following request body selects all units fetched in 2018. Place it in a
file named `2018.json`.

```
{
  "query": {
    "range" : {
      "$sc_pubdates.fetch" : {
        "gte" : "2018-01-01",
        "lt" :  "2018-12-31",
        "format": "YYYY-MM-dd"
      }
    }
  }
}
```

To retrieve units based on this query and export them to a CSV file run the
following pipeline:

```
sugarcube -Q glob_pattern:2018.json -p elastic_import,csv_export
```

Let's say I have two types of lists, one are keywords, and the other one are
city names. The following shell script iterates over two arrays, and calls a
pipeline for every possible combination of keywords/cities:

```
#!/bin/bash

declare -a cities=("aberdeen" "sheffield");
declare -a keywords=("qlikview" "expedian");

for i in "${cities[@]}"
do
  for j in "${keywords[@]}"
  do
    sugarcube -Q elastic_query:'{"query": {"bool": {"must": [{"match": {"href_text": "'"$i"'"}},{"match": {"href_text": "'"$j"'"}}]}}}' -p elastic_import --csv.filename $i-$j.csv --elastic.index my-index
  done
done
```

I can then call this script like that:

```
./pipelines.sh
```

### `elastic_complement` plugin

Complement data in the pipeline with existing data stored in
Elasticsearch. This merges new data into existing data.

**Configuration Options:**

- `elastic.host`: Set the hostname of the Elasticsearch server. Defaults to
  `localhost`.
- `elastic.port`: Set the port of the Elasticsearch server. Defaults to
  `9200`.
- `elastic.index`: Define the prefix to be used for index names. Defaults to
  `sugarcube`.

**Example:**

Search DuckDuckGo and update it with date already stored in Elasticsearch
before importing the updated version.

```
sugarcube -Q ddg_search:Keith\ Johnstone \
          -p ddg_search,elastic_complement,elastic_export
```

### `elastic_complement_left` plugin

Complement data in the pipeline with existing data stored in
Elasticsearch. This merges existing data into new data.

**Configuration Options:**

- `elastic.host`: Set the hostname of the Elasticsearch server. Defaults to
  `localhost`.
- `elastic.port`: Set the port of the Elasticsearch server. Defaults to
  `9200`.
- `elastic.index`: Define the prefix to be used for index names. Defaults to
  `sugarcube`.

**Example:**

Search DuckDuckGo and update any data stored in Elasticsearch with the new
data before exporting it again to Elasticsearch.

```
sugarcube -Q ddg_search:Keith\ Johnstone \
          -p ddg_search,elastic_complement_left,elastic_export
```

### `elastic_supplement` plugin

This is an alias for the `elastic_complement_left` plugin.

## Indexes

This plugin will create all indexes with custom mappings when they don't yet
exist. Using the `elastic.index` option it is possible to specify a prefix for
the indexes scheme. The following indexes are created with custom mappings:

- `<prefix>-web-searches`: Store all units that originate from a DuckDuckGo Or
  Google search.
- `<prefix>-feed`: Store all units that originate from an Facebook or Twitter
  feed, a Twitter search or a YouTube channel.
- `<prefix>-units`: Any unit that doesn't go into one of the above indexes is
  stored in this catchall index.

## API

This module exports the abstraction layer that is used to communicate with
Elasticsearch. It can be used to write custom scripts using the same API.

### `Elastic.Do`

```hs
Do :: (G: Generator, {host: String, port: Number, mappings: {}}): [Array, Array]
```

The `Do` function creates a context, in which a full interaction with
Elasticsearch takes place. It takes a generator function that forms the
interaction context and an configuration object containing the host and port
of the Elasticsearch server. Additionally it accepts an object containing
custom mappings. The `Do` context returns a tuple containing any results and
the history of the interaction with Elasticsearch. The generator function
receives a configured API as it's argument. This API is valid within a single
interaction context:

```js
const [results, history] = await Elastic.Do(function* ({queryByIds}) {
  yield queryByIds("sugarcube", ["id1", "id2"]);
}, {host: "localhost", port: 9200});

history.forEach(([k, meta]) => console.log(`${k}: ${JSON.stringify(meta)}.`));
// Do something with the results.
```

Every `Do` context receives the following API to Elasticsearch:

#### `query`

```hs
query :: (index: String, body: Object, amount: Number): Array
```

Search Elasticsearch using a request body in the format of the Elasticsearch
Query DSL.

```js
Elastic.Do(function* fetchTenDocuments({query}) {
  const body = {
    query: {
      href_text: "search me",
    },
  };
  yield query("sugarcube", body, 10);
});
```

`query` returns an array containing any fetched documents.

#### `queryByIds`

```hs
queryByIds :: (index: String, ids: Array): Array
```

Fetch documents by their ID. It returns an array of any document fetched from
Elasticsearch.

```js
Elastic.Do(function* fetchUnits({queryByIds}) {
  yield queryByIds("sugarcube", [1, 2, 3, 4]);
});
```

#### `bulk`

```hs
bulk :: (index: String, ops: Object): Array
```

Run a bulk operation. The `ops` object contains all the units for the
different bulk operations. Currently units can only be indexed. The `bulk`
operation returns an array containing any errors that occured.

```js
Elastic.Do(function* bulkIndex({bulk}) {
  const units = envelope.data;
  const errors = yield bulk("sugarcube", {index: units});
  if (errors.length > 0) { // ... deal with errrors }
});
```

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
