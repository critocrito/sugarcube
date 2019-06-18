---
path: "/plugins/csv_diff"
title: "csv_diff plugin"
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

Create diff stats of the current envelope with data parsed from csv files.

**Configuration**:

Uses `diff_glob_pattern` as query type.

-   `csv.delimiter` (defaults to `,`)

    Specify the csv delimiter.

-   `csv.id_fields` (required). Specify one or several field names (separated by
    a comma), that are used to determine the identity of a record

The following example compares csv files from today and yesterday.

    $(npm bin)/sugarcube -d \
      -Q glob_pattern:data/dump-$(date -d "today" +%Y-%m-%d).csv \
      -Q diff_glob_pattern:data/dump-$(date -d "yesterday" +%Y-%m-%d).csv \
      -p csv_import,csv_diff \
      --csv.id_fields name
