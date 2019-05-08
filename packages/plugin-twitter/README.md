# `@sugarcube/plugin-twitter`

This is a plugin for [SugarCube](https://gitlab.com/sugarcube/sugarcube).

## Installation

```
npm install --save @sugarcube/plugin-twitter
```

## Plugins

### `twitter_feed` plugin

Fetch the tweets of a twitter user account.

**Configuration:**

- `twitter.consumer_key`
- `twitter.consumer_secret`
- `twitter.access_token_key`
- `twitter.access_token_secret`
- `twitter.tweet_count`
- `twitter.retweets`

### `twitter_tweets` plugin

Fetch individual tweets by the Tweet ID.

**Configuration:**

- `twitter.consumer_key`
- `twitter.consumer_secret`
- `twitter.access_token_key`
- `twitter.access_token_secret`

### `twitter_friends` plugin

Fetch the friends of a twitter user account.

**Configuration:**

- `twitter.consumer_key`
- `twitter.consumer_secret`
- `twitter.access_token_key`
- `twitter.access_token_secret`

### `twitter_followers` plugin

Fetch the followers of a twitter user account.

**Configuration:**

- `twitter.consumer_key`
- `twitter.consumer_secret`
- `twitter.access_token_key`
- `twitter.access_token_secret`

### `twitter_search` plugin

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

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
