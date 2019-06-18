---
path: "/plugins/workflow_pick"
title: "workflow_pick plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.25.0"
bugs: "https://github.com/critocrito/sugarcube"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-workflow#readme"
tags: ["data","sugarcube","sugarcube-plugin","transformation"]
---

### Installation

    npm install --save @sugarcube/plugin-workflow


### Usage

Pick the list of attributes from every unit and drop the rest.

**Configuration:**

-   `workflow.pick_fields`: Specify the name of the fields to pick.

**Example:**

    sugarcube -p workflow_pick --workflow.pick_fields a,b,c
