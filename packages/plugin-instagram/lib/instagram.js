import {
  curry,
  flow,
  map,
  range,
  concat,
  merge,
  take,
  last,
  get,
  getOr,
} from "lodash/fp";
import {fold} from "dashp";
import {postEntity} from "./entities";
// FIXME: Using import throws an error.
// import rp from "request-promise";
const rp = require("request-promise");

const fetch = (username, maxId) => {
  const opts = merge(
    {uri: `https://instagram.com/${username}/media`, json: true},
    maxId ? {qs: {max_id: maxId}} : {}
  );

  return rp(opts)
    .then(getOr([], "items"))
    .catch(() => [])
    .then(map(postEntity(username)));
};

export const feed = curry((count, username) => {
  const xs = range(0, Math.ceil(count / 20));
  let lastId = -1;
  return fold(
    memo => {
      const id = flow([last, get("postId")])(memo);
      // There are no more posts.
      if (id === lastId) return memo;
      lastId = id;
      return fetch(username, id).then(concat(memo));
    },
    [],
    xs
  ).then(take(count));
});

export default {
  feed,
};
