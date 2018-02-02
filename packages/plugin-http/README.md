# `@sugarcube/plugin-http`

Plugins based on HTTP requests.

## Plugins

### `http_get`

Fetch images, files, pdf's and videos from `_sc_data`. Downloaded targets are
added to the `_sc_downloads` collection.

**Configuration Options**:

- `http.data_dir` (defaults to `./data`)

  Specify the target download directory.

### `http_wget`

Fetch whole web pages from `_sc_media`. Downloaded targets are added to the
`_sc_downloads` collection.

**Configuration Options**:

- `http.data_dir` (defaults to `./data`)

  Specify the target download directory.

- `http.wget_cmd` (defaults to `wget`)

  Specify the path to the `wget` command.
