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

The following example fetches a Youtube channel and downloads all available
videos. It uses the `media_youtubedl` plugin.

```
$(npm bin)/sugarcube -c config.json \
                     -q channels.json \
                     -p youtube_channel,media_youtubedl
```

## License

This code is licensed under the GPL3 license.
