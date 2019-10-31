# `@sugarcube/plugin-http`

Plugins based on HTTP requests.

## Installation

```
npm install --save @sugarcube/plugin-http
```

## Plugins

### `http_import` plugin

Import queries of query type `http_url` as Sugarcube units. The unit only contains the URL as `location` field. The MIME type of the url is determined and set in `_sc_media` so that other plugins can do further transformations on the unit.

**Metrics:**

- `total`: The total number of queries imported.
- `success`: The number of URLs that were successfully imported.
- `fail`: The number of URLs that failed to import.

### `http_get` plugin

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

### `http_wget` plugin

Fetch whole web pages from `_sc_media`. Downloaded targets are added to the
`_sc_downloads` collection.

**Configuration Options**:

- `http.data_dir` (defaults to `./data`)

  Specify the target download directory.

- `http.wget_cmd` (defaults to `wget`)

  Specify the path to the `wget` command.

### `http_screenshot` plugin (DEPRECATED)

This plugin is deprecated in favor of the `media_screenshot` plugin.

Fetch every URL in `_sc_media` in a headless browser and make a
screenshot. The format of the screenshot is JPEG. Downloaded targets are added
to the `_sc_downloads` collection. Screenshots are stored in `<data_dir>/<unit
id>/screenshot/<media id>`.

**Configuration Options**:

- `http.data_dir` (defaults to `./data`)

  Specify the target download directory.

The following example fetches a twitter user feed and screenshots as downloads
a HTML version of every tweet.

```
$(npm bin)/sugarcube -d \
                     -c config.json \
                     -q feeds.json \
                     -p twitter_feed,http_wget,http_screenshot
```

**Metrics:**

- `total`: The total number of screenshots taken.
- `existing`: The number of screenshots that already exist.
- `success`: The number of screenshots that were successfully taken.
- `fail`: The number of screenshots that were failed.

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
