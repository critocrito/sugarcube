import {
  curry,
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
import {foldP, flowP, tapP, caughtP} from "dashp";

import {request, throttle, cursorify, recurse} from "./utils";
import {
  tweetTransform,
  followersTransform,
  friendsTransform,
  searchTransform,
} from "./entities";

// The requests within a 15 minutes window in milliseconds.
const rateLimit = requests => 15 * 60 / requests * 1000;

// FIXME: Refactor to uncouple everything from the logger.
const apiErrors = curry((log, user, e) => {
  if (/401/.test(e.message)) {
    log.warn(`Failed to fetch ${user}: ${e.message}`);
    return [];
  } else if (e[0] && e[0].code === 34) {
    log.warn(`Failed to fetch ${user}: ${e[0].message}`);
    return [];
  }
  throw e;
});

export const feed = curry((cfg, log, users) => {
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

      return flowP(
        [
          op,
          tapP(rs => log.info(`Fetched ${size(rs)} tweets for ${user}.`)),
          caughtP(apiErrors(log, user)),
          flow([tweetTransform, concat(memo)]),
        ],
        params
      ).catch(apiErrors(log, user));
    },
    [],
    users
  );
});

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
      return flowP(
        [
          op,
          tapP(rs => log.info(`Fetched ${size(rs)} followers of ${user}.`)),
          caughtP(apiErrors(log, user)),
          flow([followersTransform, concat(memo)]),
        ],
        params
      );
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
      return flowP(
        [
          op,
          tapP(rs => log.info(`Fetched ${size(rs)} friends of ${user}.`)),
          caughtP(apiErrors(log, user)),
          flow([friendsTransform, concat(memo)]),
        ],
        params
      );
    },
    [],
    users
  );
};

export const search = curry((cfg, log, queries) => {
  const delay = rateLimit(180);
  const op = throttle(delay, request(cfg, "search/tweets.json"));

  return foldP(
    (memo, query) => {
      const q = flow([split(" "), map(encodeURIComponent), join("+")])(query);
      const params = {count: 100, q};

      return flowP(
        [
          op,
          tapP(rs =>
            log.info(
              `Fetched ${size(rs.statuses)} tweets for the term ${query}`
            )
          ),
          flow([
            property("statuses"),
            searchTransform,
            map(merge({query})),
            concat(memo),
          ]),
        ],
        params
      );
    },
    [],
    queries
  );
});

export default {feed, followers, friends, search};
