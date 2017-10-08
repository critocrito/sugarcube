# `@sugarcube/plugin-tika`

Use the [Apache Tika](https://tika.apache.org/) toolkit to detect and extract
metadata and text from over a thousand different file types.

## Plugins

### `tika_parse`

Parse a list of file specified by the query type `glob_pattern`.

```
sugarcube -Q glob_pattern:files/**/*.pdf -p tika_parse
```
