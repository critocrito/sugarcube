# `@sugarcube/plugin-http`

Plugins based on HTTP requests.

## Plugins

### `http_get` plugin

Fetch images, files, pdf's and videos from `_sc_data`. Downloaded targets are
added to the `_sc_downloads` collection.

**Configuration Options**:

- `http.data_dir` (defaults to `./data`)

  Specify the target download directory.

- `http.get_types` (defaults to "image,file,pdf,video")

  Fetch files of this media type. Separate different types using a comma.

### `http_wget` plugin

Fetch whole web pages from `_sc_media`. Downloaded targets are added to the
`_sc_downloads` collection.

**Configuration Options**:

- `http.data_dir` (defaults to `./data`)

  Specify the target download directory.

- `http.wget_cmd` (defaults to `wget`)

  Specify the path to the `wget` command.

### `http_screenshot` plugin

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

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
