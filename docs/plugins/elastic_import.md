---
path: "/plugins/elastic_import"
title: "elastic_import plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.24.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-elasticsearch#readme"
tags: ["sugarcube","sugarcube-plugin","data","transformation","elasticsearch","data storage"]
---

### Installation
    npm install --save @sugarcube/plugin-elasticsearch


### Usage
Search for units in Elasticsearch and import them into the pipeline. Search
bodies can be defined in JSON files and imported using the `glob_pattern`
query type or supplied directly using the `elastic_query` source type. All
search bodies are regular Elasticsearch [request
bodies](https://www.elastic.co/guide/en/elasticsearch/reference/6.2/search-request-body.html)
and use the [Elasticsearch query
DSL](https://www.elastic.co/guide/en/elasticsearch/reference/6.2/query-dsl.html). See
[`queries.md`](./queries.md) for more examples.

**Configuration Options:**

-   `elastic.host`: Set the hostname of the Elasticsearch server. Defaults to
    `localhost`.
-   `elastic.port`: Set the port of the Elasticsearch server. Defaults to
    `9200`.
-   `elastic.index`: Define the prefix to be used for index names. Defaults to
    `sugarcube`.
-   `elastic.amount`: Set the maximum numbers of units to import. Defaults to
    `1000`.
-   `elastic.include_fields`: Only fetch the fields specified. Defaults to fetch
    all fields. `_sc_id_hash` and `_sc_content_hash` are always fetched and
    don't need to be specified when using this option.

**Example:**

The following request body selects all units fetched in 2018. Place it in a
file named `2018.json`.

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

To retrieve units based on this query and export them to a CSV file run the
following pipeline:

    sugarcube -Q glob_pattern:2018.json -p elastic_import,csv_export

Let's say I have two types of lists, one are keywords, and the other one are
city names. The following shell script iterates over two arrays, and calls a
pipeline for every possible combination of keywords/cities:

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

I can then call this script like that:

    ./pipelines.sh
