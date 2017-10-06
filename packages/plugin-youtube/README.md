# `@sugarcube/plugin-youtube`

A plugin for [SugarCube](https://gitlab.com/sugarcube/sugarcube) that
fetches videos from youtube.

## Requirements

The [youtube-dl](https://rg3.github.io/youtube-dl/) program is required for
the `youtube_download` plugin.

## Installation

```
npm install --save @sugarcube/plugin-youtube
```

## Usage

This plugin exports the following plugins:

### `youtube_channel`

Fetch a list of videos from a channel. A query must be configured to supply
one or more channel ids.

```
[{
  type: "youtube_channel",
  term: "UCJkMlOu7faDgqh4PfzbpLdg"
}, {
  type: "youtube_channel",
  term: "UC5I2hjZYiW9gZPVkvzM8_Cw"
}]
```

The Youtube API key must be set as well. You can do this by setting the
`youtube.api_key` config option:

```
--youtube.api_key <key>
```

or setting it in the JSON configuration file:

```
{
  "youtube": {
    "api_key": "<key>"
  }
}
```

Other Possible config values are:

```
{
  "youtube": {
    "published_before": "2017-06-22",
    "published_after": "2017-06-22",
    "past_days": 30,
  }
}
```

Setting any of these increases performance, but is capped at around 500 video results.

### `youtube_download`

This plugin downloads all videos of type 'youtube_video' that are found in the
`_sc_downloads` field and calculates a sha256 hash sum of the downloaded
file. It also downloads thumbnails and subtitle files if available. The plugin
uses the external `youtube-dl` program to actually download. It has the
following configuration options:

- `youtube.download_dir`: Download all videos into this directory. Defaults to
  `downloads`.
- `youtube.download_format`: Download videos in this video format. Defaults to
  `mp4`.
- `youtube.cmd`: The path to the `youtube-dl` command. Defaults to
  `youtube-dl`, with no specific path supplied.

## Example

```
$(npm bin)/sugarcube -q queries.json -c config.json -p youtube_channel,youtube_download
```

## License

This code is licensed under the GPL3 license.
