# `@sugarcube/plugin-elasticsearch`

Use [Elasticsearch](https://www.elastic.co/products/elasticsearch) for
SugarCube data.

## Installation

```
npm install --save @sugarcube/plugin-elasticsearch
```

## Usage

## `elastic_export` plugin

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

**Example:**

```
sugarcube -Q ddg_search:Keith\ Johnstone -p ddg_search,elastic_export
```

## `elastic_import` plugin

Search for units in Elasticsearch and import them into the pipeline. Searches
are defined in JSON files and imported using the `glob_pattern` query
type. Those files are regular Elasticsearch [request
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

## `elastic_import_query` plugin

Similar to the `elastic_import` plugin, but instead of providing files of
queries, supply them directly through the query sources. The query type is
called `elastic_query`. The query term has to be a valid JSON string, that is
an Elasticsearch search body.

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
    sugarcube -Q elastic_query:'{"query": {"bool": {"must": [{"match": {"href_text": "'"$i"'"}},{"match": {"href_text": "'"$j"'"}}]}}}' -p elastic_import_query --csv.filename $i-$j.csv $@
  done
done
```

I can then call this script like that:

```
./pipelines.sh --elastic.index my-index
```

## `elastic_complement` plugin

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

## `elastic_complement_left` plugin

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
