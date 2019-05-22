---
path: "/plugins/google_reverse_images_files"
title: "google_reverse_images_files plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.24.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-google#readme"
tags: ["sugarcube","sugarcube plugin","sugarcube-plugin","data","transformation","google","search"]
---

### Installation
    npm install --save @sugarcube/plugin-google

You need at least Node 7.5.0 for this module.


### Usage
Make a Google reverse image search. Specify a glob pattern by the query type
`glob_pattern` that resolves to a list of image files.

    $(npm bin)/sugarcube -Q glob_pattern:images/**/*.jpg -p google_reverse_images_files

**Configuration Options**:

-   `google.headless`: Set to `true` to show the browser window, otherwise browse
    headless if set to `false`. Defaults to `false`.

    `sugarcube -Q google_search:Keith\ Johnstone -p google_search,tap_printf --google.headless false`
