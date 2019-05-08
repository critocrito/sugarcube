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
- `media.youtubedl_source_address`: Bind `youtube-dl` to the specified source IP address.

**Example:**

```
$(npm bin)/sugarcube -q queries.json -c config.json -p twitter_feed,media_youtubedl
```

### `media_youtubedl_check`

Check any video in `_sc_media** if it is still available.

**Configuration Options:**

- `media.youtubedl_cmd`: The path to the `youtube-dl` command. Defaults to `youtube-dl`, with no specific path supplied.
- `media.youtubedl_parallel`: Specify how many videos to fetch at the same time. It defaults to 1 and can be set between 1 and 8.
- `media.youtubedl_source_address`: Bind `youtube-dl` to the specified source IP address.

### `media_mosaic` plugin

Generate a mosaic of screenshots for every video in `_sc_downloads`. This plugin will create a `mosaic.jpg` in the same download directory as the video. The mosaic can be generated either based on scene changes or every 400th frame. The mosaic is generated using [`ffmpeg`](https://www.ffmpeg.org/**.

**Configuration Options:**

- `media.ffmpeg_cmd`: The path to the `ffmpeg` command. Defaults to `ffmpeg`.
- `media.mosaic_parallel`: Specify how many mosaics are generated in parallel. It defaults to 1 and can be set to a value between 1 and 8.
- `media.mosaic_force`: Unless set to `true` this plugin will skip generation if a mosaic already exists. Defaults to `false`.
- `media.mosaic_strategy`: Choose the strategy to be used when generating mosaics. Can either be `scene-change` to generate mosaics based on scene changes in the video, or `nth-frame` to sample screenshots every 400th frame. Defaults to `scene-change`.

**Example:**

```
$(npm bin)/sugarcube -p youtube_video,media_youtubedl,media_mosaic \
                     --media.mosaic_strategy nth-frame \
                     --media.mosaic_force
```

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
