---
path: "/plugins/instagram_feed"
title: "instagram_feed plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.24.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-instagram#readme"
tags: ["sugarcube","sugarcube plugin","sugarcube-plugin","data","transformation","instagram"]
---

### Installation
NOTE: Instagram changed the way their website works. This means that this
package currently doesn't work. Feel free to send a merge request though.

-   [Plugins](#plugins)
-   [Development](#development)


### Usage
Fetch posts for an Instagram user feed. The `query_type` is
`instagram_user`. It has the `instagram.post_count`, which determines how many
posts are fetched. It defaults to 100.

    sugarcube -Q instagram_user:<username> \
               -p instagram_feed \
               --instagram.post_count 50
