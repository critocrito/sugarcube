# SugarCube media plugin

Operations on media files and URL's.

## Plugins

### `media_exif` plugin

Extract exif data from image urls in `_sc_media` fields.

`sugarcube -c config.json -q queries.json -p google_images,media_exif`

### `media_youtubedl` plugin

Download all videos of type `video` that are stored in `_sc_media`. SHA256 and MD5 sums are calculated for those downloads. It also downloads thumbnails and subtitle files if available. The plugin uses the external `youtube-dl` program to actually download. This makes it [compatible](https://rg3.github.io/youtube-dl/supportedsites.html) with a variety of websites.

**Configuration Options**:

- `media.data_dir`: Download all videos into this directory. Defaults to `data`.
- `media.download_format`: Download videos in this video format. Defaults to `mp4`.
- `media.youtubedl_cmd`: The path to the `youtube-dl` command. Defaults to `youtube-dl`, with no specific path supplied.
- `media.youtubedl_parallel`: Specify how many videos to fetch at the same time. It defaults to 1 and can be set between 1 and 8.
- `media.youtubedl_force_download`: Set this flag to `true` for force a download of the video, even if it already exists.

**Example:**

```
$(npm bin)/sugarcube -q queries.json -c config.json -p twitter_feed,media_youtubedl
```

### `media_youtubedl_check`

Check any video in `_sc_media** if it is still available.

**Configuration Options:**

- `media.youtubedl_cmd`: The path to the `youtube-dl` command. Defaults to `youtube-dl`, with no specific path supplied.
- `media.youtubedl_parallel`: Specify how many videos to fetch at the same time. It defaults to 1 and can be set between 1 and 8.

## License

This code is licensed under the GPL3 license.
