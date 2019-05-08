# `@sugarcube/plugin-google`

You need at least Node 7.5.0 for this module.

## Plugins

### `google_search`

Search on Google for a term, specified by the query type `google_search`.

```
$(npm bin)/sugarcube -Q google_search:Keith\ Johnstone -p google_search,tap_printf
```

**Configuration Options**:

- `google.headless`: Set to `true` to show the browser window, otherwise browse
  headless if set to `false`. Defaults to `false`.

  `sugarcube -Q google_search:Keith\ Johnstone -p google_search,tap_printf --google.headless false`

### `google_images`

Make a Google image search for a term, specified by the query type `google_search`.

```
$(npm bin)/sugarcube -Q google_search:Keith\ Johnstone -p google_images,tap_printf
```

**Configuration Options**:

- `google.headless`: Set to `true` to show the browser window, otherwise browse
  headless if set to `false`. Defaults to `false`.

  `sugarcube -Q google_search:Keith\ Johnstone -p google_search,tap_printf --google.headless false`

### `google_reverse_images_files`

Make a Google reverse image search. Specify a glob pattern by the query type
`glob_pattern` that resolves to a list of image files.

```
$(npm bin)/sugarcube -Q glob_pattern:images/**/*.jpg -p google_reverse_images_files
```

**Configuration Options**:

- `google.headless`: Set to `true` to show the browser window, otherwise browse
  headless if set to `false`. Defaults to `false`.

  `sugarcube -Q google_search:Keith\ Johnstone -p google_search,tap_printf --google.headless false`

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
