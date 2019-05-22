---
path: "/plugins/youtube_channel"
title: "youtube_channel plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.24.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-youtube#readme"
tags: ["sugarcube","sugarcube plugin","sugarcube-plugin","data","transformation","youtube"]
---

### Installation
    npm install --save @sugarcube/plugin-youtube


### Usage
Fetch a list of videos from a channel. A query must be configured to supply one or more channel ids.

    [{
      type: "youtube_channel",
      term: "UCJkMlOu7faDgqh4PfzbpLdg"
    }, {
      type: "youtube_channel",
      term: "https://www.youtube.com/channel/UC_QIfHvN9auy2CoOdSfMWDw/featured"
    }]

The channel query can be provided either as an id (e.g. `UC_QIfHvN9auy2CoOdSfMWDw`) or as the full URL to the channel (e.g. `https://www.youtube.com/channel/UC_QIfHvN9auy2CoOdSfMWDw/featured`). The last segment of the channel URL (in this case `featured`) is optional. The relevant part is the `/channel/<channel-id>` part of the URL.

The Youtube API key must be set as well. You can do this by setting the `youtube.api_key` config option:

    --youtube.api_key <key>

or setting it in the JSON configuration file:

    {
      "youtube": {
        "api_key": "<key>"
      }
    }

Other Possible config values are:

    {
      "youtube": {
        "published_before": "2017-06-22",
        "published_after": "2017-06-22",
        "past_days": 30,
      }
    }

Setting any of these increases performance, but is capped at around 500 video results.

The following example fetches a Youtube channel and downloads all available
videos. It uses the `media_youtubedl` plugin.

    $(npm bin)/sugarcube -c config.json \
                         -q channels.json \
                         -p youtube_channel,media_youtubedl
