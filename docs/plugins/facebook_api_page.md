---
path: "/plugins/facebook_api_page"
title: "facebook_api_page plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.24.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-facebook#readme"
tags: ["sugarcube","sugarcube plugin","sugarcube-plugin","data","transformation","facebook"]
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
Fetch data about a Facebook page. It uses `facebook_page` as query type.

    sugarcube -Q facebook_page:<page_name> \
               -p facebook_api_page \
               --facebook.app_id <app_id> \
               --facebook.app_secret <app_secret>

**Configuration**

-   **facebook.app_id**
-   **facebook.app_secret**
