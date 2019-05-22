---
path: "/plugins/workflow_multiplex_end"
title: "workflow_multiplex_end plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.24.0"
bugs: "https://github.com/critocrito/sugarcube"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-workflow#readme"
tags: ["sugarcube","sugarcube-plugin","data","transformation"]
---

### Installation
    npm install --save @sugarcube/plugin-workflow


### Usage
This plugin acts as a stopper for \`workflow_multiplex\*\* to signal where the multiplexing should end. It will then resume the remainder of the pipeline as a single run. Not that the data envelope is not carried over into the remainder pipeline. Only the queries, cache and stats are preserved.

**Example:**

    sugarcube -p workflow_multiplex,youtube_channel,media_youtubedl,workflow_multiplex_end,mail_report_stats \
              -q queries.json

The above example will multiplex the `youtube_channel,media_youtubedl` bits into batches of one query per batch. After all batches finished, the pipeline resumes all plugins after `workflow_multiplex_end`. In this case the `mail_report_stats` plugin is called a single time.
