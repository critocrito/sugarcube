---
path: "/plugins/facebook_api_user"
title: "facebook_api_user plugin"
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

Fetch data about a user. It uses `facebook_user` as query type.

    sugarcube -Q facebook_user:<user_id> \
               -p facebook_api_user \
               --facebook.app_id <app_id> \
               --facebook.app_secret <app_secret>

You need the `userid`, the username won't work. To get it:

-   Browse to the Facebook page of that user.
-   Right-click and _view source_.
-   Use `CTRL-f` to search through the source and search for
    `user.php?id=`. This is your user id.

**Configuration**

-   **facebook.app_id**
-   **facebook.app_secret**
