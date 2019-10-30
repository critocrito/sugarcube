# SugarCube media plugin

Operations on media files and URL's.

## Installation

```
npm install --save @sugarcube/plugin-media
```

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
- `media.youtubedl_delay`: Wait between invocations of youtube-dl for `DELAY <= N < 2xDELAY` seconds. Defaults to 0 seconds.
- `media.youtubedl_source_addresses`: Bind `youtube-dl` to the one or more source IP address. If there are more than one addresses, balance in a round robin fashion. Defaults to the default route of the host.

    ```
    {
      "media": {
        "youtubedl_source_addresses": ["192.168.2.100", "192.168.2.101"]
      }
    }
    ```

**Example:**

```
$(npm bin)/sugarcube -q queries.json -c config.json -p twitter_feed,media_youtubedl
```

**Metrics:**

- `total`: The total number of videos downloaded.
- `existing`: The number of videos that already existed.
- `fail`: The number of videos that failed to download.
- `success`: The number of videos that were successfully downloaded.

### `media_youtubedl_check`

Check any video in `_sc_media** if it is still available.

**Configuration Options:**

- `media.youtubedl_cmd`: The path to the `youtube-dl` command. Defaults to `youtube-dl`, with no specific path supplied.
- `media.youtubedl_parallel`: Specify how many videos to fetch at the same time. It defaults to 1 and can be set between 1 and 8.
- `media.youtubedl_delay`: Wait between invocations of youtube-dl for `DELAY <= N < 2xDELAY` seconds. Defaults to 0 seconds.
- `media.youtubedl_source_addresses`: Bind `youtube-dl` to the one or more source IP address. If there are more than one addresses, balance in a round robin fashion. Defaults to the default route of the host. Set it to an array of IP addresses in a JSON config file.

    ```
    {
      "media": {
        "youtubedl_source_addresses": ["192.168.2.100", "192.168.2.101"]
      }
    }
    ```
**Metrics:**

- `total`: The total number of videos checked.
- `fail`: The number of videos that failed to check.
- `success`: The number of videos that were successfully checked.

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

**Metrics:**

- `total`: The total number of video mosaics generated.
- `existing`: The number of mosaics that already existed.
- `fail`: The number of mosaics that failed to generate.
- `success`: The number of mosaics that were successfully generated.

### `media_file_import` plugin

Import media files into the data collection. This is a natural fit with the `fs_unfold` plugin.

**Configuration Options:**

- `media.data_dir`: Import all videos into this directory. Defaults to `data`.
- `media.import_video_format`: Import videos in this video format. Defaults to `mp4`.
- `media.ffmpeg_cmd`: The path to the `ffmpeg` command which is used to import videos. Defaults to `ffmpeg`, with no specific path supplied.
- `media.import_parallel`: Specify how many files to import at the same time. It defaults to 1 and can be set between 1 and 8.
- `media.force_import`: Set this flag to `true` for force an import of the file, even if it already exists.

**Example:**

```
$(npm bin)/sugarcube -Q glob_pattern:~/files/* -p fs_unfold,media_file_import
```

**Metrics:**

- `total`: The total number of files imported.
- `existing`: The number of files that already existed.
- `fail`: The number of files that failed to import.
- `success`: The number of files that were successfully imported.

### `media_warc` plugin

Archive media of type `url` as a gzipped [WARC](https://iipc.github.io/warc-specifications/) file.

**Configuration Options**:

- `media.data_dir`: Archive all URL's into this directory. Defaults to `data`.
- `media.warc_force_download`: Set this flag to `true` for force a archival of the URL, even if it already exists.

**Example:**

```
$(npm bin)/sugarcube -q queries.json -c config.json -p http_import,media_warc
```

**Metrics:**

- `total`: The total number of URLs archived.
- `existing`: The number of URLs that already existed as an archive.
- `fail`: The number of URLs that failed to archive.
- `success`: The number of URL's that were successfully archived.

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
