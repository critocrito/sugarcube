# `@sugarcube/plugin-tika`

Use the [Apache Tika](https://tika.apache.org/) toolkit to detect and extract
metadata and text from over a thousand different file types.

## Plugins

### `tika_parse` plugin

Parse a list of file specified by the query type `glob_pattern`.

```
sugarcube -Q glob_pattern:files/**/*.pdf -p tika_parse
```

### `tika_links` plugin

This plugin iterates over all links in `_sc_media` and fetches the text and
meta data for this link. This plugin ignores any errors that the fetch might
throw.

### `tika_location` plugin

This plugin parses any location specified using the `tika_location_field`
query type. This fetches the text and meta data of e.g. a url inside the unit.

```
sugarcube -Q google_search:Keith\ Johnstone \
          -Q tika_location_field:href \
          -p google_search,tika_location
```

The text and meta data are added into the `_sc_media` collection and placed
directly on the unit as well, e.g. if the location field is `href`, the
`href_text` and `href_meta` fields are added to the unit.

### `tika_export` plugin

Export the text and meta data that `tika_location` parses to a file.

```
sugarcube -Q google_search:Keith\ Johnstone \
          -p google_search,tika_location,tika_export \
          --tika.location_field href
```

**Configuration Options**:

- `tika.data_dir`: Specify the target directory where to store all
  files. Defaults to `./data/tika_location`.

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
