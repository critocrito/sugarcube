---
path: "/plugins/http_get"
title: "http_get plugin"
author: "Christo <Christo@cryptodrunks.net>"
version: "0.25.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-http#readme"
tags: ["data","http","sugarcube","sugarcube plugin","sugarcube-plugin","transformation"]
---

### Installation

    npm install --save @sugarcube/plugin-http


### Usage

Fetch images, files, pdf's and videos from `_sc_data`. Downloaded targets are
added to the `_sc_downloads` collection.

**Configuration Options**:

-   `http.data_dir` (defaults to `./data`)

    Specify the target download directory.

-   `http.get_types` (defaults to "image,file,pdf,video")

    Fetch files of this media type. Separate different types using a comma.
