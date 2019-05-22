---
path: "/plugins/workflow_merge_query"
title: "workflow_merge_query plugin"
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
Merge any fields from the query object into units acquired for this query. This allows to annotate data with data stored alongside the query sources. This plugin will skip the merge if the unit already has a value set for this field. This behavior can be changed by setting the `--overflow.overwrite_query_merge` flag.

**Example:**

    sugarcube -p sheets_queries,youtube_video,workflow_merge_query \
              --google.query_fields last_access,cid.incident_code,notes \
              --workflow.merge_query_fields cid.incident_code,notes

The above example fetches queries from a Google spreadsheet and along the query `type` and `term` fetches the fields `last_access`, `cid.incident_code` and `notes`. The `cid.incident_code` and `notes` fields are merged into the data units found for this `type` and `term`.

**Configuration:**

-   `workflow.merge_query_fields`: An array of field names that should be merged into the unit.
-   `workflow.overwrite_query_merge`: Set to `true` to merge fields even if a value is already set on the unit for this field. Defaults to `false`.
