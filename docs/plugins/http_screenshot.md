---
path: "/plugins/http_screenshot"
title: "http_screenshot plugin"
author: "Christo <Christo@cryptodrunks.net>"
version: "0.24.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-http#readme"
tags: ["sugarcube","sugarcube plugin","sugarcube-plugin","data","transformation","http"]
---

### Installation
    npm install --save @sugarcube/plugin-http


### Usage
Fetch every URL in `_sc_media` in a headless browser and make a
screenshot. The format of the screenshot is JPEG. Downloaded targets are added
to the `_sc_downloads` collection. Screenshots are stored in `<data_dir>/<unit
id>/screenshot/<media id>`.

**Configuration Options**:

-   `http.data_dir` (defaults to `./data`)

    Specify the target download directory.

The following example fetches a twitter user feed and screenshots as downloads
a HTML version of every tweet.

    $(npm bin)/sugarcube -d \
                         -c config.json \
                         -q feeds.json \
                         -p twitter_feed,http_wget,http_screenshot
