---
path: "/plugins/csv_export"
title: "csv_export plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.24.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-csv#readme"
tags: ["sugarcube","sugarcube plugin","sugarcube-plugin","data","transformation","csv"]
---

### Installation
    npm install --save @sugarcube/plugin-csv


### Usage
Export sugarcube data in csv format to a file.

**Configuration**:

-   `csv.delimiter` (defaults to `,`) Specify the csv delimiter.
-   `csv.filename` (defaults to `out.csv`). Specify the target file.
-   `csv.skip_empty` Use this option to only export data pipelines that contain
    any data.


    $(npm bin)/sugarcube -c config.json -p google_search,csv_export --csv.filename data.csv
