import {flow, map, merge, property, get, getOr, set} from "lodash/fp";
import {ofP} from "dashp";
import elastic from "elasticsearch";
import {utils} from "@sugarcube/core";

import {unstripify, stripUnderscores} from "./utils";
import defaultMappings from "./mappings";
import queries from "./queries";

const {curry2, curry3, curry4} = utils;

const types = {
  ddg_search: "web-searches",
  google_search: "web-searches",
  facebook_api_feed: "feed",
  twitter_feed: "feed",
  twitter_search: "feed",
  youtube_channel: "feed",
  default: "units",
};

export const connect = host => new elastic.Client({host, log: "warning"});

export const toHeader = (index, unit) => ({
  _index: index,
  _id: unit._sc_id_hash,
});

export const toMsg = (index, unit) =>
  stripUnderscores((toHeader(index, unit), {body: unit}));

export const createIndex = curry4(
  "createIndex",
  async (index, type, mapping, client) => {
    const body = {
      mappings: {
        units: {properties: mapping},
      },
    };
    const indexName = `${index}-${type}`;

    if (await client.indices.exists({index: indexName})) return ofP(null);
    return client.indices.create({index: indexName, body});
  },
);

export const query = curry4("query", async (index, body, amount, client) => {
  const response = await client.search({
    index: `${index}`,
    size: amount,
    body,
    requestTimeout: "90000",
  });

  const data = map(u => {
    const source = flow([property("_source"), unstripify])(u);
    return Object.assign(
      {},
      source,
      {_sc_elastic_score: get("_score", u)},
      get("highlight", u)
        ? {
            _sc_elastic_highlights: flow([get("highlight"), unstripify])(u),
          }
        : {},
    );
  }, get("hits.hits", response));

  const meta = merge(response.timed_out ? {timedOut: true} : {}, {
    took: get("took", response),
    total: get("hits.total", response),
  });

  return [data, meta];
});

export const bulk = curry4(
  "bulk",
  async (index, ops, client, customMappings) => {
    const sorted = ops.index.reduce((memo, unit) => {
      const type = types[unit._sc_source]
        ? types[unit._sc_source]
        : types.default;
      // eslint-disable-next-line no-param-reassign
      if (!memo[type]) memo[type] = [];
      // eslint-disable-next-line no-param-reassign
      memo[type] = memo[type].concat([
        {index: toHeader(`${index}-${type}`, unit)},
        stripUnderscores(unit),
      ]);
      return memo;
    }, {});

    await Promise.all(
      map(
        key =>
          createIndex(
            index,
            key,
            Object.assign(defaultMappings[key], customMappings),
            client,
          ),
        Object.keys(sorted),
      ),
    );

    const responses = await Promise.all(
      map(
        key => client.bulk({body: sorted[key], type: "units", refresh: true}),
        Object.keys(sorted),
      ),
    );

    return responses.reduce(
      ([errors, meta], resp) => {
        const took = meta.took + resp.took;
        const [newErrors, stats] = resp.items.reduce(
          (acc, item) => {
            const path = `${item.index._index}.${item.index.result}`;
            const count = getOr(0, path, acc[1]);
            return [
              item.index.error
                ? acc[0].concat([{id: item.index._id, error: item.index.error}])
                : acc[0],
              merge(acc[1], set(path, count + 1, {})),
            ];
          },
          [errors, meta.stats],
        );
        return [newErrors, {took, stats}];
      },
      [[], {took: 0, stats: {}}],
    );
  },
);

export const queryByIds = curry3("queryByIds", (index, ids, client) => {
  const body = queries.byIds(ids);
  return query(index, body, ids.length, client);
});

export const Elastic = {
  Do: curry2("ElasticDo", async (G, {host, port, mappings}) => {
    const client = connect(`${host}:${port}`);
    const api = {bulk, query, queryByIds};
    const customMappings = stripUnderscores(mappings || {});
    const generator = G(api);
    let data;
    let history = [];

    const chain = async nextG => {
      const {done, value} = await nextG.next(data);
      if (done) return ofP([value || data, history]);
      const [result, meta] = await value(client, customMappings);
      // All curried function names have the format of <name>-<int> where
      // <int> is the number of missing arguments. For a prettier output in
      // the history strip -<int> from the name.
      history = history.concat([[value.name.replace(/-.*$/, ""), meta]]);
      data = result;
      return chain(nextG);
    };

    return ofP(chain(generator));
  }),
};
