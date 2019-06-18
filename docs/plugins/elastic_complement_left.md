---
path: "/plugins/elastic_complement_left"
title: "elastic_complement_left plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.25.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-elasticsearch#readme"
tags: ["data","data storage","elasticsearch","sugarcube","sugarcube-plugin","transformation"]
---

### Installation

    npm install --save @sugarcube/plugin-elasticsearch


### Usage

Complement data in the pipeline with existing data stored in
Elasticsearch. This merges existing data into new data.

**Configuration Options:**

-   `elastic.host`: Set the hostname of the Elasticsearch server. Defaults to
    `localhost`.
-   `elastic.port`: Set the port of the Elasticsearch server. Defaults to
    `9200`.
-   `elastic.index`: Define the prefix to be used for index names. Defaults to
    `sugarcube`.

**Example:**

Search DuckDuckGo and update any data stored in Elasticsearch with the new
data before exporting it again to Elasticsearch.

    sugarcube -Q ddg_search:Keith\ Johnstone \
              -p ddg_search,elastic_complement_left,elastic_export
