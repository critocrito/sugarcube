---
path: "/plugins/google_images"
title: "google_images plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.25.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-google#readme"
tags: ["data","google","search","sugarcube","sugarcube plugin","sugarcube-plugin","transformation"]
---

### Installation

    npm install --save @sugarcube/plugin-google

You need at least Node 7.5.0 for this module.


### Usage

Make a Google image search for a term, specified by the query type `google_search`.

    $(npm bin)/sugarcube -Q google_search:Keith\ Johnstone -p google_images,tap_printf

**Configuration Options**:

-   `google.headless`: Set to `true` to show the browser window, otherwise browse
    headless if set to `false`. Defaults to `false`.

    `sugarcube -Q google_search:Keith\ Johnstone -p google_search,tap_printf --google.headless false`
