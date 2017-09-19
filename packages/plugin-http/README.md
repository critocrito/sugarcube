# `@sugarcube/plugin-http`

Plugins based on HTTP requests.

## Plugins

### `http_get`

Fetch images, files, pdf's and videos from `_lf_downloads`.

**Configuration Options**:

- `http.download_dir` (defaults to `./downloads`)

  Specify the target download directory.

### `http_wget`

Fetch whole web pages from `_lf_downloads`.

**Configuration Options**:

- `http.download_dir` (defaults to `./downloads`)

  Specify the target download directory.

- `http.wget_cmd` (defaults to `wget`)

  Specify the path to the `wget` command.
