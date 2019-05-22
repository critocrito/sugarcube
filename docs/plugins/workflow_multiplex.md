---
path: "/plugins/workflow_multiplex"
title: "workflow_multiplex plugin"
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
Break all queries into batches with a size configured by `workflow.multiplex_size` and run the remainder of the pipeline once for each batch. This allows to break the whole pipeline into smaller executions. This helps to deal with data processes that would yield a huge number of observations.

**Example:**

    sugarcube -p workflow_multiplex,youtube_channel,media_youtubedl \
              -q queries.json

The above example will run the pipeline \`youtube_channel,media_youtubedl\*\* once for every query separately.

**Configuration:**

-   `workflow.multiplex_size`: Set the size of each batch of queries. Defaults to 1.
-   `workflow.multiplex_continue_on_error`: As a default, if any batch throws an error, the execution stops. Using this flag continues execution, even if an individual batch throws an error.

**Example:**

    sugarcube -p workflow_multiplex,youtube_channel,media_youtubedl \
              --workflow.multiplex_size 10 \
              --workflow.multiplex_continue_on_error \
              -q queries.json
