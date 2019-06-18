---
path: "/plugins/aqicn_station"
title: "aqicn_station plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.25.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-aqicn#readme"
tags: ["air pollution","data","sugarcube","sugarcube plugin","sugarcube-plugin","transformation"]
---

### Installation

    npm install --save @sugarcube/plugin-aqicn


### Usage

Query the air pollution data of a single station. The query type is
`aqicn_station`.

    sugarcube -Q aqicn_station:serbia/beograd/mostar -p aqicn_station,tap_printf
