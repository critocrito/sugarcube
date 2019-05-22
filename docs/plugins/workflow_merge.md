---
path: "/plugins/workflow_merge"
title: "workflow_merge plugin"
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
Merge additional fields into every unit of the data pipeline. Additional fields are specified using the `workflow_merge` query source. The additional fields have to be provided as a valid JSON object.

**Example:**

    sugarcube -p test_generate,workflow_merge,tap_printf \
              -Q workflow_merge:'{"hello": "world"}'
