---
path: "/plugins/tika_export"
title: "tika_export plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.25.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-tika#readme"
tags: ["data","documents","documents parsing","pdf extraction","sugarcube","sugarcube plugin","sugarcube-plugin","tika","transformation"]
---

### Installation

    npm install --save @sugarcube/plugin-tika

To use this plugin you need as well Java installed.


### Usage

Export the text and meta data that `tika_location` parses to a file.

    sugarcube -Q google_search:Keith\ Johnstone \
              -p google_search,tika_location,tika_export \
              --tika.location_field href

**Configuration Options**:

-   `tika.data_dir`: Specify the target directory where to store all
    files. Defaults to `./data/tika_location`.
