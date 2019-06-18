---
path: "/plugins/tika_parse"
title: "tika_parse plugin"
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

Parse a list of file specified by the query type `glob_pattern`.

    sugarcube -Q glob_pattern:files/**/*.pdf -p tika_parse
