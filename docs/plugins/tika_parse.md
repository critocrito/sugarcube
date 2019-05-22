---
path: "/plugins/tika_parse"
title: "tika_parse plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.24.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-tika#readme"
tags: ["sugarcube","sugarcube plugin","sugarcube-plugin","data","transformation","tika","documents","documents parsing","pdf extraction"]
---

### Installation
    npm install --save @sugarcube/plugin-tika

To use this plugin you need as well Java installed.


### Usage
Parse a list of file specified by the query type `glob_pattern`.

    sugarcube -Q glob_pattern:files/**/*.pdf -p tika_parse
