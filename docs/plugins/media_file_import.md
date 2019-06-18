---
path: "/plugins/media_file_import"
title: "media_file_import plugin"
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

Import media files into the data collection. This is a natural fit with the `fs_unfold` plugin.

**Configuration Options:**

-   `media.data_dir`: Import all videos into this directory. Defaults to `data`.
-   `media.import_video_format`: Import videos in this video format. Defaults to `mp4`.
-   `media.ffmpeg_cmd`: The path to the `ffmpeg` command which is used to import videos. Defaults to `ffmpeg`, with no specific path supplied.
-   `media.import_parallel`: Specify how many files to import at the same time. It defaults to 1 and can be set between 1 and 8.
-   `media.force_import`: Set this flag to `true` for force an import of the file, even if it already exists.

**Example:**

    $(npm bin)/sugarcube -Q glob_pattern:~/files/* -p fs_unfold,media_file_import
