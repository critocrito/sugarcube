# `@sugarcube/plugin-workflow`

A collection of plugins that support investigation workflows.

## Installation

```
npm install --save @sugarcube/plugin-workflow
```

## Plugins

### `workflow_merge` plugin

Merge additional fields into every unit of the data pipeline. Additional fields are specified using the `workflow_merge` query source. The additional fields have to be provided as a valid JSON object.

**Example:**

```
sugarcube -p test_generate,workflow_merge,tap_printf \
          -Q workflow_merge:'{"hello": "world"}'
```

### `workflow_merge_query` plugin

Merge any fields from the query object into units acquired for this query. This allows to annotate data with data stored alongside the query sources. This plugin will skip the merge if the unit already has a value set for this field. This behavior can be changed by setting the `--overflow.overwrite_query_merge` flag.

**Example:**

```
sugarcube -p sheets_queries,youtube_video,workflow_merge_query \
          --google.query_fields last_access,cid.incident_code,notes \
          --workflow.merge_query_fields cid.incident_code,notes
```

The above example fetches queries from a Google spreadsheet and along the query `type` and `term` fetches the fields `last_access`, `cid.incident_code` and `notes`. The `cid.incident_code` and `notes` fields are merged into the data units found for this `type` and `term`.


**Configuration:**

- `workflow.merge_query_fields`: An array of field names that should be merged into the unit.
- `workflow.overwrite_query_merge`: Set to `true` to merge fields even if a value is already set on the unit for this field. Defaults to `false`.

### `workflow_multiplex` plugin

Break all queries into batches with a size configured by `workflow.multiplex_size` and run the remainder of the pipeline once for each batch. This allows to break the whole pipeline into smaller executions. This helps to deal with data processes that would yield a huge number of observations.

**Example:**

```
sugarcube -p workflow_multiplex,youtube_channel,media_youtubedl \
          -q queries.json
```

The above example will run the pipeline `youtube_channel,media_youtubedl** once for every query separately.

**Configuration:**

- `workflow.multiplex_size`: Set the size of each batch of queries. Defaults to 1.
- `workflow.multiplex_continue_on_error`: As a default, if any batch throws an error, the execution stops. Using this flag continues execution, even if an individual batch throws an error.

**Example:**

```
sugarcube -p workflow_multiplex,youtube_channel,media_youtubedl \
          --workflow.multiplex_size 10 \
          --workflow.multiplex_continue_on_error \
          -q queries.json
```

### `workflow_multiplex_end` plugin

This plugin acts as a stopper for `workflow_multiplex** to signal where the multiplexing should end. It will then resume the remainder of the pipeline as a single run. Not that the data envelope is not carried over into the remainder pipeline. Only the queries, cache and stats are preserved.

**Example:**

```
sugarcube -p workflow_multiplex,youtube_channel,media_youtubedl,workflow_multiplex_end,mail_report_stats \
          -q queries.json
```

The above example will multiplex the `youtube_channel,media_youtubedl` bits into batches of one query per batch. After all batches finished, the pipeline resumes all plugins after `workflow_multiplex_end`. In this case the `mail_report_stats` plugin is called a single time.

### `workflow_omit` plugin

Omit individual fields from all units. The fields can be specified on the command line using a comma separated string or as an array in the JSON config file.

**Configuration:**

- `workflow.omit_fields`: Specify the name of the fields to omit.

**Example:**

```
sugarcube -p workflow_omit --workflow.omit_fields a,b,c
```

### `workflow_pick` plugin

Pick the list of attributes from every unit and drop the rest.

**Configuration:**

- `workflow.pick_fields`: Specify the name of the fields to pick.

**Example:**

```
sugarcube -p workflow_pick --workflow.pick_fields a,b,c
```

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
