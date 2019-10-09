import {forEach, merge, values} from "lodash/fp";
import feedPlugin from "./feed";
import followersPlugin from "./followers";
import friendsPlugin from "./friends";
import searchPlugin from "./search";
import tweetsPlugin from "./plugins/tweets";
import {
  parseTweetId,
  parseTwitterUser,
  normalizeTwitterTweetUrl,
  normalizeTwitterUserUrl,
  isTwitterFeed,
  isTwitterTweet,
} from "./utils";

const plugins = {
  twitter_feed: feedPlugin,
  twitter_followers: followersPlugin,
  twitter_friends: friendsPlugin,
  twitter_search: searchPlugin,
  twitter_tweets: tweetsPlugin,
};

const recursivePlugins = [followersPlugin, friendsPlugin];

// Arguments common to all plugins.
forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "twitter.consumer_key": {
        type: "string",
        nargs: 1,
        desc: "The twitter consumer key",
      },
      "twitter.consumer_secret": {
        type: "string",
        nargs: 1,
        desc: "The twitter consumer secret",
      },
      "twitter.access_token_key": {
        type: "string",
        nargs: 1,
        desc: "The twitter access key",
      },
      "twitter.access_token_secret": {
        type: "string",
        nargs: 1,
        desc: "The twitter access token secret",
      },
    },
    p.argv,
  );
}, values(plugins));

// Arguments common for recursive plugins
forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "twitter.recurse_depth": {
        type: "number",
        nargs: 1,
        default: 0,
        desc: "How deep to recurse into the graph",
      },
    },
    p.argv,
  );
}, recursivePlugins);

export {
  plugins,
  parseTweetId,
  parseTwitterUser,
  normalizeTwitterTweetUrl,
  normalizeTwitterUserUrl,
  isTwitterFeed,
  isTwitterTweet,
};
export default {
  plugins,
  parseTweetId,
  parseTwitterUser,
  normalizeTwitterTweetUrl,
  normalizeTwitterUserUrl,
  isTwitterFeed,
  isTwitterTweet,
};
