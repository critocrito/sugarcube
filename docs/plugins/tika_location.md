---
path: "/plugins/tika_location"
title: "tika_location plugin"
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

This plugin parses any location specified using the `tika_location_field`
query type. This fetches the text and meta data of e.g. a url inside the unit.

    sugarcube -Q google_search:Keith\ Johnstone \
              -Q tika_location_field:href \
              -p google_search,tika_location

The text and meta data are added into the `_sc_media` collection and placed
directly on the unit as well, e.g. if the location field is `href`, the
`href_text` and `href_meta` fields are added to the unit.
