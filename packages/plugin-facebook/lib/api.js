import {merge, get} from "lodash/fp";
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

const fetchEdge = async (edge, fields, limit, fetcher, id) => {
  let results = [];
  let offset = 0;
  for (;;) {
    // eslint-disable-next-line no-await-in-loop
    const data = await fetcher(`${id}/${edge}`, {
      fields,
      offset,
      limit: 100,
    }).then(get("data"));
    results = results.concat(data);
    offset = results.length;
    if (data.length === 0) break;
    if (limit !== 0 && results.length >= limit) break;
  }
  return results;
};

export const fetchByAppToken = curry4(
  "fetchByAppToken",
  (appId, appSecret, endpoint, qs) => {
    const accessToken = `${appId}|${appSecret}`;

    return fetchApi(accessToken, endpoint, qs);
  },
);

export const page = curry2("page", (fetcher, id) =>
  fetcher(id, {fields: pageFields}).then(pageEntity),
);

export const user = curry2("user", (fetcher, id) =>
  fetcher(id, {fields: userFields}).then(userEntity),
);

export const feed = curry3("feed", (limit, fetcher, id) =>
  fetchEdge("feed", postFields, limit, fetcher, id).then(feedEntity),
);
