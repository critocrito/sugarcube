# `@sugarcube/plugin-twitter`

This is a plugin for [SugarCube](https://gitlab.com/sugarcube/sugarcube).

## Installation

```
npm install --save @sugarcube/plugin-twitter
```

## Usage

This plugin exports the following plugins:

### `twitter_feed` data source

Fetch the tweets of a twitter user account.

### `twitter_tweets`

Fetch individual tweets by the Tweet ID.

### `twitter_friends` data source

Fetch the friends of a twitter user account.

### `twitter_followers` data source

Fetch the followers of a twitter user account.

### `twitter_search` data source

Search for tweets.

Configure the profile to contain the `twitter_query` key. It will make a
search for tweets. To search for a specific hashtag, prefix the query with
`%23`, which translates to `#`.

## Configuration

- `twitter.consumer_key`
- `twitter.consumer_secret`
- `twitter.access_token_key`
- `twitter.access_token_secret`
- `twitter.tweet_count` (for twitter_feed)
- `twitter.retweets` (for twitter_feed)
- `twitter.recurse_depth` (for twitter_friends and twitter_followers)

The `twitter_search` plugin takes additionally the following optional
parameters:

- `twitter.language`: Limit tweets to the following languages provided as [ISO
  639-1](http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code,
  e.g. **pt** or **es**.
- `twitter.geocode`: Limit tweets to the specified `langitude,latitude,radius`
  triplet, e.g. 37.781157,-122.398720,3km. The radius can be either specified
  as **km** or as **mi**.
