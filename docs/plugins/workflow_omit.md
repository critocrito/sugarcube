---
path: "/plugins/workflow_omit"
title: "workflow_omit plugin"
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

Omit individual fields from all units. The fields can be specified on the command line using a comma separated string or as an array in the JSON config file.

**Configuration:**

-   `workflow.omit_fields`: Specify the name of the fields to omit.

**Example:**

    sugarcube -p workflow_omit --workflow.omit_fields a,b,c
