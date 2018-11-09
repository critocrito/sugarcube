# `@sugarcube/plugin-workflow`

A collection of plugins that support investigation workflows.

## Installation

```
npm install --save @sugarcube/plugin-workflow
```

## Usage

## `workflow_merge` plugin

Merge additional fields into every unit of the data pipeline. Additional fields are specified using the `workflow_merge` query source. The additional fields have to be provided as a valid JSON object.

**Example:**

```
sugarcube -p test_generate,workflow_merge,tap_printf \
          -Q workflow_merge:'{"hello": "world"}'
```

## `workflow_multiplex` plugin

Break all queries into batches with a size configured by `workflow.multiplex_size` and run the remainder of the pipeline once for each batch. This allows to break the whole pipeline into smaller executions.

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
