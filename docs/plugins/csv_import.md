---
path: "/plugins/csv_import"
title: "csv_import plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.25.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-csv#readme"
tags: ["csv","data","sugarcube","sugarcube plugin","sugarcube-plugin","transformation"]
---

### Installation

    npm install --save @sugarcube/plugin-csv


### Usage

Import a csv file, and turn it into sugarcube data.

**Configuration**:

Uses `glob_pattern` as query type.

-   `csv.delimiter` (defaults to `,`)

    Specify the csv delimiter.

-   `csv.id_fields` (required). Specify one or several field names (separated by
    a comma), that are used to determine the identity of a record


    $(npm bin)/sugarcube -Q glob_pattern:data/**/*.csv -p csv_import,tap_printf --csv.id_fields firstName,lastName
