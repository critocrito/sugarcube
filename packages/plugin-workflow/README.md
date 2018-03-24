# `@sugarcube/plugin-workflow`

A collection of plugins that support investigation workflows.

## Installation

```
npm install --save @sugarcube/plugin-workflow
```

## Usage

## `workflow_merge` plugin

Merge additional fields into every unit of the data pipeline. Additional
fields are specified using the `workflow_merge` query source. The additional
fields have to be provided as a valid JSON object.

**Example:**

```
sugarcube -p test_generate,workflow_merge,tap_printf \
          -Q workflow_merge:'{"hello": "world"}'
```
