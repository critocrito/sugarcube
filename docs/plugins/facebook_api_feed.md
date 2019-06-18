---
path: "/plugins/facebook_api_feed"
title: "facebook_api_feed plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.25.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-facebook#readme"
tags: ["data","facebook","sugarcube","sugarcube plugin","sugarcube-plugin","transformation"]
---

### Installation

    npm install --save @sugarcube/plugin-facebook

It requires you to register your app.

-   Login to your Facebook account.
-   Register as a Facebook [developer](https://developer.facebook.com).
-   Register yourself an [app](https://developers.facebook.com/apps/).

You'll need the `app_id` and the `app_secret`.

-   [Plugins](#plugins)
-   [Development](#development)


### Usage

Fetch the feed of a Facebook page. It uses `facebook_page` as query type. This
works currently for pages only.

    sugarcube -Q facebook_id:filmsforaction \
              -p facebook_api_feed \
              --facebook.app_id <app_id> \
              --facebook.app_secret <app_secret>

**Configuration Options**:

-   **facebook.app_id**: The app id issued by Facebook.
-   **facebook.app_secret**: The secret token issued by Facebook.
-   **facebook.feed_limit**: Limit the number of messages to download. When set
    to 0 download all available messages. Defaults to 0.
