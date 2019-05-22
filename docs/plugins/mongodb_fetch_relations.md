---
path: "/plugins/mongodb_fetch_relations"
title: "mongodb_fetch_relations plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.24.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-mongodb#readme"
tags: ["sugarcube","sugarcube plugin","sugarcube-plugin","data","transformation"]
---

### Installation
    npm install --save @sugarcube/plugin-mongodb


### Usage
Fetch relations by `_sc_id_hash` from the database. Supply the query type
`mongodb_relation` that specifes the id hash.

**Configuration:**

-   `mongodb.uri`: The database connection string (defaults to `mongodb://localhost/sugarcube`).
