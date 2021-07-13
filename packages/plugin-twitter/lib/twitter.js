import {
  curry,
  flow,
  map,
  merge,
  concat,
  get,
  join,
  split,
  size,
  property,
  isNaN,
} from "lodash/fp";
import {foldP, flowP, tapP, caughtP} from "dashp";
import {createFeatureDecisions} from "@sugarcube/core";

import {request, throttle, cursorify, recurse} from "./utils";
import {
  followersTransform,
  friendsTransform,
  searchTransform,
  tweetNcube,
  tweetLegacy,
} from "./entities";

// The requests within a 15 minutes window in milliseconds.
const rateLimit = (requests) => ((15 * 60) / requests) * 1000;

// FIXME: Refactor to uncouple everything from the logger.
const apiErrors = curry((log, user, e) => {
  if (/401/.test(e.message)) {
    log.warn(`Failed to fetch ${user}: ${e.message}`);
    return [];
  }
  if (e[0] && e[0].code === 34) {
    log.warn(`Failed to fetch ${user}: ${e[0].message}`);
    return [];
  }
  throw e;
});

export const parseApiErrors = (e) => {
  if (e[0] && e[0].message != null) return e[0].message;
  if (e[0]) return JSON.stringify(e[0]);
  if (e.message != null) return e.message;
  return JSON.stringify(e);
};

export const tweets = curry((cfg, tweetIds) => {
  const delay = rateLimit(300);
  const op = throttle(delay, request(cfg, "statuses/lookup.json"));
  const params = {
    id: tweetIds.join(","),
    map: true,
    tweet_mode: "extended",
  };
  return flowP([op], params);
});

export const feed = curry((cfg, user) => {
  const count = cfg.twitter.tweet_count;
  const retweets = cfg.twitter.tweet_count;

  const delay = rateLimit(1500);
  const op = throttle(delay, request(cfg, "statuses/user_timeline.json"));
  const params = {
    count,
    include_rts: retweets,
    [isNaN(Number(user)) ? "screen_name" : "user_id"]: user,
  };

  const decisions = createFeatureDecisions();
  const transform = decisions.canNcube() ? tweetNcube : tweetLegacy;

  return flowP([op, map(transform)], params);
});

export const followers = (cfg, log, users) => {
  const recurseDepth = cfg.twitter.recurse_depth;
  const delay = rateLimit(15);
  const op = recurse(
    recurseDepth,
    "screen_name",
    cursorify(throttle(delay, request(cfg, "followers/list.json"))),
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
          tapP((rs) => log.info(`Fetched ${size(rs)} followers of ${user}.`)),
          caughtP(apiErrors(log, user)),
          flow([followersTransform, concat(memo)]),
        ],
        params,
      );
    },
    [],
    users,
  );
};

export const friends = (cfg, log, users) => {
  const recurseDepth = cfg.twitter.recurse_depth;
  const delay = rateLimit(15);
  const op = recurse(
    recurseDepth,
    "screen_name",
    cursorify(throttle(delay, request(cfg, "friends/list.json"))),
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
          tapP((rs) => log.info(`Fetched ${size(rs)} friends of ${user}.`)),
          caughtP(apiErrors(log, user)),
          flow([friendsTransform, concat(memo)]),
        ],
        params,
      );
    },
    [],
    users,
  );
};

export const search = curry((cfg, log, queries) => {
  const modifiers = ["twitter.language", "twitter.geocode"].reduce(
    (memo, key) => {
      switch (key) {
        case "twitter.language":
          return get(key, cfg) ? merge(memo, {lang: get(key, cfg)}) : memo;
        case "twitter.geocode":
          return get(key, cfg) ? merge(memo, {geocode: get(key, cfg)}) : memo;
        default:
          return memo;
      }
    },
    {},
  );
  const delay = rateLimit(180);
  const op = throttle(delay, request(cfg, "search/tweets.json"));

  return foldP(
    (memo, query) => {
      const q = flow([split(" "), map(encodeURIComponent), join("+")])(query);
      const params = merge({count: 100, q}, modifiers);

      return flowP(
        [
          op,
          tapP((rs) =>
            log.info(
              `Fetched ${size(rs.statuses)} tweets for the term ${query}`,
            ),
          ),
          flow([
            property("statuses"),
            searchTransform,
            map(merge({query})),
            concat(memo),
          ]),
        ],
        params,
      );
    },
    [],
    queries,
  );
});

export default {feed, followers, friends, search};
