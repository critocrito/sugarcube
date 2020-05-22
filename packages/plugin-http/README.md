# `@sugarcube/plugin-http`

Plugins based on HTTP requests.

## Installation

```shell
npm install --save @sugarcube/plugin-http
```

## Plugins

### `http_import`

Import queries of query type `http_url` as Sugarcube units. The unit only contains the URL as `location` field. The MIME type of the url is determined and set in `_sc_media` so that other plugins can do further transformations on the unit.

Import of regular websites are done using a browser session (based on the [Adapting the Hypercube Model to Archive Deferred Representations and Their Descendants](https://arxiv.org/abs/1601.05142) paper by Justin F. Brunelle, Michele C. Weigle and Michael L. Nelson). Imports of other types (e.g. documents) are done using simple HTTP requests.

**Configuration:**

- `http.import_parallel`: Specify how many HTTP URL's to import at the same time. It defaults to 1 and can be set between 1 and 8.

**Example:**

The following example imports a website and extracts the contents from it. Any images found are fetched as well and finally it creates a WARC archive and takes a screenshot.

```shell
$(npm bin)/sugarcube -p http_import,media_fetch,media_warc,media_screenshot \
                     -Q http_url:'https://mwatana.org/en/airstrike-on-detention-center/' \
                     --http.import_parallel 2
```

**Metrics:**

- `total`: The total number of queries imported.
- `success`: The number of URLs that were successfully imported.
- `fail`: The number of URLs that failed to import.

### `http_get` (DEPRECATED)

This plugin is deprecated in favor of the `media_fetch` plugin.

Fetch images, files, pdf's and videos from `_sc_data`. Downloaded targets are
added to the `_sc_downloads` collection.

**Configuration Options**:

- `http.data_dir` (defaults to `./data`)

  Specify the target download directory.

- `http.get_types` (defaults to "image,file,pdf,video")

  Fetch files of this media type. Separate different types using a comma.

**Metrics:**

- `total`: The total number of files fetched.
- `existing`: The number of files that were already previously fetched.
- `success`: The number of files that were successfully fetched.
- `fail`: The number of files that were failed to download.

### `http_wget`

Fetch whole web pages from `_sc_media`. Downloaded targets are added to the
`_sc_downloads` collection.

**Configuration Options**:

- `http.data_dir` (defaults to `./data`)

  Specify the target download directory.

- `http.wget_cmd` (defaults to `wget`)

  Specify the path to the `wget` command.

## Feature flags

- `ncube` sets the new and Ncube compatible data format. This is still optional but will become the new default in the future.

```shell
$(npm bin)/sugarcube -p http_import \
                     -Q http_url:'https://mwatana.org/en/airstrike-on-detention-center/' \
                     -D ncube
```

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
