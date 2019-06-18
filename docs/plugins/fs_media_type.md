---
path: "/plugins/fs_media_type"
title: "fs_media_type plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.25.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-fs#readme"
tags: ["data","sugarcube","sugarcube-plugin","transformation"]
---

### Installation

    npm install --save @sugarcube/plugin-fs


### Usage

Populate the `_sc_media` field from a location field of the unit. Successive plugins can therefore operate on files that were imported using `fs_unfold`.

**Configuration:**

-   `fs.location_field`: Specify the name of the field that contains the file path. Defaults to `location`.
