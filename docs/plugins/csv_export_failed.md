---
path: "/plugins/csv_export_failed"
title: "csv_export_failed plugin"
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

Export any failure stats of a pipeline run to a CSV file. The file is named `failed-stats-<marker>.csv`.

**Configuration:**

-   `csv.delimiter`: Specify the csv delimiter. Defaults to `,`.
-   `csv.data_dir`: Specify the directory location to write the file to. Defaults to `./data`.
-   `csv.label`: Specify an additional label to add to the file name of the exported CSV file.
