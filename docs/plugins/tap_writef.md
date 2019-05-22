---
path: "/plugins/tap_writef"
title: "tap_writef plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.24.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-tap#readme"
tags: ["sugarcube","sugarcube plugin","sugarcube-plugin","data","transformation"]
---

### Installation
    npm install --save @sugarcube/plugin-tap


### Usage
    $(npm bin)/sugarcube -c cfg.json -p twitter_feed,tap_writef

Write the data part of the envelope to a file.

**Configuration**:

-   `tap.limit` :: Limit the output to <n> data units.

     Example: Print only 5 units of data.

     `$(npm bin)/sugarcube -c cfg.json -p twitter_feed,tap_writef --tap.limit 5`

-   `tap.filename` :: Specify the name of the output file. Defaults to
    `data-<marker>.json`.
