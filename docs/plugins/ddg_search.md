---
path: "/plugins/ddg_search"
title: "ddg_search plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.25.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-ddg#readme"
tags: ["data","duckduckgo","sugarcube","sugarcube plugin","sugarcube-plugin","transformation"]
---

### Installation

    npm install --save @sugarcube/plugin-ddg


### Usage

    $(npm bin)/sugarcube -c cfg.json -p ddg_search

This is a data fetching plugin.

It looks for the query terms of type `ddg_search`, e.g.:

    [{
      "type": "ddg_search",
      "term": "Some Search Term"
    }]
