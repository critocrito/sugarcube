# `@sugarcube/plugin-twitter`

This is a plugin for [SugarCube](https://gitlab.com/sugarcube/sugarcube).

## Installation

```shell
npm install --save @sugarcube/plugin-twitter
```

## Plugins

### `twitter_feed`

Fetch the tweets of a twitter user account.

**Configuration:**

- `twitter.consumer_key`
- `twitter.consumer_secret`
- `twitter.access_token_key`
- `twitter.access_token_secret`
- `twitter.tweet_count`
- `twitter.retweets\*\*

**Metrics:**

- `total`: The total number of feeds queried.
- `fail`: The number of feeds that failed to query.
- `success`: The number of feeds that succeeded.
- `fetched`: The number of tweets that were fetched from all feeds.

### `twitter_tweets`

Fetch individual tweets by the Tweet ID.

**Configuration:**

- `twitter.consumer_key`
- `twitter.consumer_secret`
- `twitter.access_token_key`
- `twitter.access_token_secret\*\*

**Metrics:**

- `total`: The total number of tweets queried.
- `fail`: The number of tweets that failed to download.
- `success`: The number tweets that succeeded to download.

### `twitter_friends`

Fetch the friends of a twitter user account.

**Configuration:**

- `twitter.consumer_key`
- `twitter.consumer_secret`
- `twitter.access_token_key`
- `twitter.access_token_secret`

### `twitter_followers`

Fetch the followers of a twitter user account.

**Configuration:**

- `twitter.consumer_key`
- `twitter.consumer_secret`
- `twitter.access_token_key`
- `twitter.access_token_secret`

### `twitter_search`

Search for tweets.

Configure the profile to contain the `twitter_query` key. It will make a
search for tweets. To search for a specific hashtag, prefix the query with
`%23`, which translates to `#`.

**Configuration:**

- `twitter.consumer_key`
- `twitter.consumer_secret`
- `twitter.access_token_key`
- `twitter.access_token_secret`
- `twitter.language`: Limit tweets to the following languages provided as [ISO
  639-1](http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code,
  e.g. **pt** or **es**.
- `twitter.geocode`: Limit tweets to the specified `langitude,latitude,radius`
  triplet, e.g. 37.781157,-122.398720,3km. The radius can be either specified
  as **km** or as **mi**.

### `twitter_filter_failing`

This plugin verifies against the Twitter API that each unit that is a Tweet
exists, and returns all failing Tweets as units in the envelope.

This plugin doesn't collect missing tweets as failures, but it counts the metric.

**Configuration:**

- `twitter.consumer_key`
- `twitter.consumer_secret`
- `twitter.access_token_key`
- `twitter.access_token_secret`

**Metrics:**

- `total`: The total number of Twitter tweets queried.
- `fail`: The number of tweets that failed. This metric is tracked continuously
  as it is detected.
- `success`: The number of tweets that exist.
- `missing`: The number of tweets that failed. This metric is emitted once at
  the end of the plugin containing the total number of failed tweets.

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
