# `@sugarcube/plugin-youtube`

A plugin for [SugarCube](https://gitlab.com/sugarcube/sugarcube) that fetches video and channel data from youtube.

## Requirements

A Youtube API key is required to use these plugins. To obtain one follow those steps:

- Use your existing Google account, or create [a new account](https://accounts.google.com).
- Go to the [Developers Console](https://console.developers.google.com) and login with your account.
- First create a new project. Click on `Select a Project` and then click on `New Project`.
- Select the newly created project, and as a next step click on `Enable APIS and Services`.
- Select the `Youtube Data API v3` and enable it.
- On the Youtube API page click on `Create Credentials`. Select the `Youtube Data API v3` to use, `Other UI` to use it from and pick `Public Data` on the question what data to access. This will generate an API key for you.

## Installation

```shell
npm install --save @sugarcube/plugin-youtube
```

## Plugins

### `youtube_video` plugin

Fetch details for an individual video by it's id. It uses the `youtube_video` query type. The query can be specified either as the video id (e.g. `oMOSiag3dxg`) or as the full URL to the video (e.g. `https://www.youtube.com/watch?v=oMOSiag3dxg`).

The Youtube API key must be set as well. You can do this by setting the `youtube.api_key` config option:

```shell
--youtube.api_key <key>
```

or setting it in the JSON configuration file:

```json
{
  "youtube": {
    "api_key": "<key>"
  }
}
```

**Metrics:**

- `total`: The total number of Youtube videos fetched.
- `fail`: The number of videos that failed.
- `success`: The number of videos that were successfully fetched.

### `youtube_channel` plugin

Fetch a list of videos from a channel. A query must be configured to supply one or more channel ids.

```json
[{
  type: "youtube_channel",
  term: "UCJkMlOu7faDgqh4PfzbpLdg"
}, {
  type: "youtube_channel",
  term: "https://www.youtube.com/channel/UC_QIfHvN9auy2CoOdSfMWDw/featured"
}]
```

The channel query can be provided either as an id (e.g. `UC_QIfHvN9auy2CoOdSfMWDw`) or as the full URL to the channel (e.g. `https://www.youtube.com/channel/UC_QIfHvN9auy2CoOdSfMWDw/featured`). The last segment of the channel URL (in this case `featured`) is optional. The relevant part is the `/channel/<channel-id>` part of the URL.

The Youtube API key must be set as well. You can do this by setting the `youtube.api_key` config option:

```shell
--youtube.api_key <key>
```

or setting it in the JSON configuration file:

```json
{
  "youtube": {
    "api_key": "<key>"
  }
}
```

Other Possible config values are:

```json
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

```shell
$(npm bin)/sugarcube -c config.json \
                     -q channels.json \
                     -p youtube_channel,media_youtubedl
```

**Metrics:**

- `total`: The total number of Youtube channels queried.
- `fail`: The number of channels that failed.
- `success`: The number of channels that succeeded to download.
- `fetched`: The number of videos that are fetched from the channels.

### `youtube_filter_failing` plugin

This plugin verifies against the Youtube API that each unit that is a Youtube video exists, and returns all failing videos as units in the envelope. It is meant as the first step in a two step process to verify the number of videos that were taken down by Youtube. The output of this plugin can be send straight to the `media_youtubedl_check` plugin for a more detailed check.

This plugin doesn't collect missing videos as failures, but it counts the metric.

**Configuration:**

- `youtube.api_key`: The API key for Youtube.com. This option is required.

**Example:**

```json
{
  "plugins": [
    "elastic_import",
    "youtube_filter_failing",
    "media_youtubedl_check"
  ],
  "youtube": {
    "api_key": "<key>"
  },
  "queries": [
    { "type": "glob_pattern", "term": "./es-queries/all-youtube-videos.json" }
  ]
}
```

**Metrics:**

- `total`: The total number of Youtube videos queried.
- `fail`: The number of videos that failed.
- `success`: The number of videos that exist.

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
