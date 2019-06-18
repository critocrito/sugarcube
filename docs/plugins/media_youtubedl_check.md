---
path: "/plugins/media_youtubedl_check"
title: "media_youtubedl_check plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.25.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-media#readme"
tags: ["@sugarcube/plugin","data","exif","images","media","sugarcube","sugarcube plugin","sugarcube-plugin","transformation"]
---

### Installation

    npm install --save @sugarcube/plugin-media


### Usage

Check any video in \`\_sc_media\*\* if it is still available.

**Configuration Options:**

-   `media.youtubedl_cmd`: The path to the `youtube-dl` command. Defaults to `youtube-dl`, with no specific path supplied.
-   `media.youtubedl_parallel`: Specify how many videos to fetch at the same time. It defaults to 1 and can be set between 1 and 8.
-   `media.youtubedl_source_address`: Bind `youtube-dl` to the specified source IP address.
