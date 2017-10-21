# `@sugarcube/plugin-regex`

Match the contents of a field again regular expression queries.

## Installation

```
npm install --save @sugarcube/plugin-regex
```

## Usage

## `regex_match` plugin

Match the contents of a field against one or more regular expression
queries. The query type is `regex_pattern`. Multiple queries are combined
using logical OR.

**Configuration Options**

- `regex.field`: Specify the field to match.

```
sugarcube -Q google_search:Keith\ Johnstone,regex_pattern:company -p google_search,regex_match,tap_printf --regex.field description
```
