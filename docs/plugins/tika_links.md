---
path: "/plugins/tika_links"
title: "tika_links plugin"
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

This plugin iterates over all links in `_sc_media` and fetches the text and
meta data for this link. This plugin ignores any errors that the fetch might
throw.