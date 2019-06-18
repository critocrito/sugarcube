---
path: "/plugins/youtube_video"
title: "youtube_video plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.25.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-youtube#readme"
tags: ["data","sugarcube","sugarcube plugin","sugarcube-plugin","transformation","youtube"]
---

### Installation

    npm install --save @sugarcube/plugin-youtube


### Usage

Fetch details for an individual video by it's id. It uses the `youtube_video` query type. The query can be specified either as the video id (e.g. `oMOSiag3dxg`) or as the full URL to the video (e.g. `https://www.youtube.com/watch?v=oMOSiag3dxg`).

The Youtube API key must be set as well. You can do this by setting the `youtube.api_key` config option:

    --youtube.api_key <key>

or setting it in the JSON configuration file:

    {
      "youtube": {
        "api_key": "<key>"
      }
    }
