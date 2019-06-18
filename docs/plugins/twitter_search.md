---
path: "/plugins/twitter_search"
title: "twitter_search plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.25.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-twitter#readme"
tags: ["data","sugarcube","sugarcube plugin","sugarcube-plugin","transformation","twitter"]
---

### Installation

    npm install --save @sugarcube/plugin-twitter


### Usage

Search for tweets.

Configure the profile to contain the `twitter_query` key. It will make a
search for tweets. To search for a specific hashtag, prefix the query with
`%23`, which translates to `#`.

**Configuration:**

-   `twitter.consumer_key`
-   `twitter.consumer_secret`
-   `twitter.access_token_key`
-   `twitter.access_token_secret`
-   `twitter.language`: Limit tweets to the following languages provided as [ISO
    639-1](http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code,
    e.g. **pt** or **es**.
-   `twitter.geocode`: Limit tweets to the specified `langitude,latitude,radius`
    triplet, e.g. 37.781157,-122.398720,3km. The radius can be either specified
    as **km** or as **mi**.
