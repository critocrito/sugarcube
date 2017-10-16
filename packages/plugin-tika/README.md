# `@sugarcube/plugin-tika`

Use the [Apache Tika](https://tika.apache.org/) toolkit to detect and extract
metadata and text from over a thousand different file types.

## Plugins

### `tika_parse`

Parse a list of file specified by the query type `glob_pattern`.

```
sugarcube -Q glob_pattern:files/**/*.pdf -p tika_parse
```

### `tika_links`

This plugin iterates over all links in `_sc_links` and fetches the text and
meta data for this link. This plugin ignores any errors that the fetch might
throw.

### `tika_location`

This plugin parses any location specified with the `tika.location_field`
configuration options. This allows to fetch, e.g. a url inside of the unit.

```
sugarcube -Q google_search:Keith\ Johnstone -p google_search,tika_location --tika.location_field href
```

**Configuration Options**:

- `tika.location_field`: Specify the field name to look for the location of
  the URI or file to parse. Defaults to `location`.
