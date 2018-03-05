import {curry, merge, getOr} from "lodash/fp";
import request from "request-promise";

import {pageEntity, userEntity, feedEntity} from "./entities";
import {pageFields, userFields, postFields} from "./fields";

const FB_API_URL = "https://graph.facebook.com";
const FB_API_VERSION = "v2.10";

const fetchApi = curry((accessToken, endpoint, qs) => {
  const opts = {
    uri: [FB_API_URL, FB_API_VERSION, endpoint].join("/"),
    json: true,
    qs: merge(qs, {
      access_token: accessToken,
    }),
  };

  return request(opts);
});

const fetchNode = curry((fields, fetcher, id) => fetcher(id, {fields}));

const fetchEdge = curry((edge, fields, fetcher, id) =>
  fetcher(`${id}/${edge}`, {
    fields,
    limit: 100,
  }).then(getOr([], "data"))
);

const fetchPage = fetchNode(pageFields);
const fetchUser = fetchNode(userFields);
const fetchFeed = fetchEdge("feed", postFields);

export const fetchByAppToken = curry((appId, appSecret, endpoint, qs) => {
  const accessToken = `${appId}|${appSecret}`;

  return fetchApi(accessToken, endpoint, qs);
});

export const page = curry((fetcher, id) =>
  Promise.all([
    fetchPage(fetcher, id),
    fetchFeed(fetcher, id),
  ]).then(([node, feed]) => pageEntity(merge(node, {feed})))
);

export const user = curry((fetcher, id) =>
  Promise.all([
    fetchUser(fetcher, id),
    fetchFeed(fetcher, id),
  ]).then(([node, feed]) => userEntity(merge(node, {feed})))
);

export const feed = curry((fetcher, id) =>
  fetchFeed(fetcher, id).then(feedEntity)
);
