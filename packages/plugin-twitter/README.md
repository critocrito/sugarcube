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
