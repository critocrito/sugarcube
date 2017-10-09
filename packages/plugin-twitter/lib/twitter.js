import {
  flow,
  map,
  merge,
  concat,
  join,
  split,
  parseInt,
  size,
  property,
  isNaN,
} from "lodash/fp";
import {foldP} from "combinators-p";

import {request, throttle, cursorify, recurse} from "./utils";
import {
  tweetTransform,
  followersTransform,
  friendsTransform,
  searchTransform,
} from "./entities";

// The requests within a 15 minutes window in milliseconds.
const rateLimit = requests => 15 * 60 / requests * 1000;

export const feed = (cfg, log, users) => {
  const count = cfg.twitter.tweet_count;
  const retweets = cfg.twitter.tweet_count;

  const delay = rateLimit(1500);
  const op = throttle(delay, request(cfg, "statuses/user_timeline.json"));

  return foldP(
    (memo, user) => {
      const params = merge(
        {
          count,
          include_rts: retweets,
        },
        isNaN(parseInt(10, user))
          ? {screen_name: user.replace(/^@/, "")}
          : {user_id: user}
      );

      return op(params)
        .tap(results =>
          log.info(`Fetched ${size(results)} tweets for ${user}.`)
        )
        .then(flow([tweetTransform, concat(memo)]));
    },
    [],
    users
  );
};

export const followers = (cfg, log, users) => {
  const recurseDepth = cfg.twitter.recurse_depth;
  const delay = rateLimit(15);
  const op = recurse(
    recurseDepth,
    "screen_name",
    cursorify(throttle(delay, request(cfg, "followers/list.json")))
  );

  return foldP(
    (memo, user) => {
      const params = {
        screen_name: user,
        count: 200,
        include_user_entities: true,
      };
      return op(params)
        .tap(rs => log.info(`Fetched ${size(rs)} followers of ${user}.`))
        .then(flow([followersTransform, concat(memo)]));
    },
    [],
    users
  );
};

export const friends = (cfg, log, users) => {
  const recurseDepth = cfg.twitter.recurse_depth;
  const delay = rateLimit(15);
  const op = recurse(
    recurseDepth,
    "screen_name",
    cursorify(throttle(delay, request(cfg, "friends/list.json")))
  );

  return foldP(
    (memo, user) => {
      const params = {
        screen_name: user,
        count: 200,
        include_user_entities: true,
      };
      return op(params)
        .tap(rs => log.info(`Fetched ${size(rs)} friends of ${user}.`))
        .then(flow([friendsTransform, concat(memo)]));
    },
    [],
    users
  );
};

export const search = (cfg, log, queries) => {
  const delay = rateLimit(180);
  const op = throttle(delay, request(cfg, "search/tweets.json"));

  return foldP(
    (memo, query) => {
      const q = flow([split(" "), map(encodeURIComponent), join("+")])(query);
      const params = {count: 100, q};

      return op(params)
        .tap(result =>
          log.info(
            `Fetched ${size(result.statuses)} tweets for the term ${query}`
          )
        )
        .then(
          flow([
            property("statuses"),
            searchTransform,
            map(merge({query})),
            concat(memo),
          ])
        );
    },
    [],
    queries
  );
};

export default {feed, followers, friends, search};
