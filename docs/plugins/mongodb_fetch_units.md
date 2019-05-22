---
path: "/plugins/mongodb_fetch_units"
title: "mongodb_fetch_units plugin"
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
Fetch units by `_sc_id_hash` from the database. Supply the query type
`mongodb_unit` that specifies the id hash of the unit.

    sugarcube -d -Q mongodb_unit:06b11b54d8c7c62af2c058d8c1f814cac5415bf149b790d447f0b34280f625d6 -p mongodb_fetch_units,tap_printf

**Configuration:**

-   `mongodb.uri`: The database connection string (defaults to `mongodb://localhost/sugarcube`).
