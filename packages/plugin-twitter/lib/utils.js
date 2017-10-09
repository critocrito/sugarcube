import {
  flow,
  curry,
  map,
  reduce,
  merge,
  mergeAll,
  concat,
  omit,
  uniq,
  pluck,
  join,
  get,
  compact,
  flatten,
  keys,
} from "lodash/fp";
import {foldP} from "combinators-p";
import pify from "pify";
import Twitter from "twitter";
import moment from "moment";

const mapObj = map.convert({cap: false});

export const paramsString = flow([mapObj((k, v) => `${k}=${v}`), join("&")]);

export const twitterDate = ds =>
  moment(ds, "ddd MMM D HH:mm:ss Z YYYY").toDate();

const client = curry(
  (consumerKey, consumerSecret, accessToken, accessSecret) => {
    const t = new Twitter({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      access_token_key: accessToken,
      access_token_secret: accessSecret,
    });

    return {
      getAsync: pify(t.get),
    };
  }
);

export const request = curry((cfg, baseUrl, params) =>
  client(
    get("twitter.consumer_key", cfg),
    get("twitter.consumer_secret", cfg),
    get("twitter.consumer_access_token_key", cfg),
    get("twitter.consumer_access_token_secret", cfg)
  ).getAsync(baseUrl, params)
);

export const cursorify = fn => {
  const cursor = -1;
  const cursorFields = [
    "next_cursor",
    "next_cursor_str",
    "previous_cursor",
    "previous_cursor_str",
  ];

  const iter = (params, nextCursor, results = []) => {
    const cursorParams = merge(params, {cursor: nextCursor});

    return fn(cursorParams).then(result => {
      // We stop the recursion when the cursor is set to 0. See twitter API.
      if (result.next_cursor === 0) {
        const final = concat(results, result);

        return flow([
          map(omit(cursorFields)),
          reduce((memo, rs) => concat(memo, keys(rs)), []),
          uniq,
          reduce((memo, k) => flow([compact, pluck(k), flatten])(final), []),
        ])(final);
      }

      return iter(params, result.next_cursor_str, concat(results, result));
    });
  };

  return params => iter(params, cursor);
};

export const throttle = curry((ms, fn) => {
  let queue = Promise.resolve();

  return params => {
    const res = queue.then(() => fn(params));
    queue = Promise.join(res, queue.delay(ms)).return();
    return res;
  };
});

export const recurse = curry((maxDepth, key, fn) => {
  const iter = (params, depth, recurseFrom = null) =>
    fn(params).then(results => {
      if (depth < maxDepth) {
        return foldP(
          (memo, result) => {
            const nextDepth = depth + 1;
            const target = result[key];

            return iter(
              merge(params, {[key]: target}),
              nextDepth,
              target
            ).then(r =>
              concat(
                memo,
                mergeAll([
                  result,
                  {_sc_graph_depth: depth, _sc_graph_from: recurseFrom},
                  map(
                    merge({_sc_graph_depth: nextDepth, _sc_graph_from: target}),
                    r
                  ),
                ])
              )
            );
          },
          [],
          results
        );
      }
      return results;
    });

  return params => iter(params, 0, params[key]);
});

export default {
  paramsString,
  twitterDate,
  request,
  cursorify,
  throttle,
  recurse,
};
