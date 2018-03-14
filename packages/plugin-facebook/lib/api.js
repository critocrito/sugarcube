import {merge, getOr} from "lodash/fp";
import {utils} from "@sugarcube/core";
import request from "request-promise";

import {pageEntity, userEntity, feedEntity} from "./entities";
import {pageFields, userFields, postFields} from "./fields";

const {curry2, curry3, curry4} = utils;

const FB_API_URL = "https://graph.facebook.com";
const FB_API_VERSION = "v2.10";

const fetchApi = curry3("fetchApi", (accessToken, endpoint, qs) => {
  const opts = {
    uri: [FB_API_URL, FB_API_VERSION, endpoint].join("/"),
    json: true,
    qs: merge(qs, {
      access_token: accessToken,
    }),
  };

  return request(opts);
});

const fetchNode = curry3("fetchNode", (fields, fetcher, id) =>
  fetcher(id, {fields})
);

const fetchEdge = curry4("fetchEdge", (edge, fields, fetcher, id) =>
  fetcher(`${id}/${edge}`, {
    fields,
    limit: 100,
  }).then(getOr([], "data"))
);

const fetchPage = curry2("fetchPage", (fetcher, id) =>
  fetchNode(pageFields, fetcher, id)
);
const fetchUser = curry2("fetchUser", (fetcher, id) =>
  fetchNode(userFields, fetcher, id)
);
const fetchFeed = curry2("fetchFeed", (fetcher, id) =>
  fetchEdge("feed", postFields, fetcher, id)
);

export const fetchByAppToken = curry4(
  "fetchByAppToken",
  (appId, appSecret, endpoint, qs) => {
    const accessToken = `${appId}|${appSecret}`;

    return fetchApi(accessToken, endpoint, qs);
  }
);

export const page = curry2("page", (fetcher, id) =>
  Promise.all([
    fetchPage(fetcher, id),
    fetchFeed(fetcher, id),
  ]).then(([node, feed]) => pageEntity(merge(node, {feed})))
);

export const user = curry2("user", (fetcher, id) =>
  Promise.all([
    fetchUser(fetcher, id),
    fetchFeed(fetcher, id),
  ]).then(([node, feed]) => userEntity(merge(node, {feed})))
);

export const feed = curry2("feed", (fetcher, id) =>
  fetchFeed(fetcher, id).then(feedEntity)
);
