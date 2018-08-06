import {flow, map, merge, property, get, getOr, set} from "lodash/fp";
import {ofP} from "dashp";
import elastic from "elasticsearch";
import {utils} from "@sugarcube/core";

import {unstripify, stripUnderscores} from "./utils";
import defaultMappings from "./mappings";
import queries from "./queries";

const {curry2, curry3, curry4} = utils;

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

    if (await client.indices.exists({index})) return ofP(null);
    return client.indices.create({index, body});
  },
);

export const query = curry4("query", async (index, body, amount, client) => {
  const response = await client.search({
    index,
    body,
    size: amount,
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
    const type = "units";
    const toIndex = (ops.index || []).reduce(
      (memo, unit) =>
        memo.concat([{index: toHeader(index, unit)}, stripUnderscores(unit)]),
      [],
    );
    const toUpdate = (ops.update || []).reduce(
      (memo, unit) =>
        memo.concat([
          {update: toHeader(index, unit)},
          {doc: stripUnderscores(unit)},
        ]),
      [],
    );
    const body = toIndex.concat(toUpdate);
    const mappings = Object.assign({}, defaultMappings, customMappings);

    await createIndex(index, type, mappings, client);
    const response = await client.bulk({body, type, refresh: true});

    const {took, items} = response;
    return items.reduce(
      (memo, item) => {
        const i = item.index || item.update;
        const path = `${i._index}.${i.result}`;
        const count = getOr(0, path, memo[1]);
        return [
          i.error ? memo[0].concat([{id: i._id, error: i.error}]) : memo[0],
          merge(memo[1], set(path, count + 1, {})),
        ];
      },
      [[], {took}],
    );
  },
);

export const queryByIds = curry3("queryByIds", (index, ids, client) => {
  const body = queries.byIds(ids);
  return query(index, body, ids.length, client);
});

export const queryOne = curry3("queryOne", async (index, id, client) => {
  const {_version: version, _type: type, _source: data} = await client.get({
    index,
    id,
    type: "_all",
  });
  return [data, {version, type}];
});

export const Elastic = {
  Do: curry2("ElasticDo", async (G, {host, port, mappings}) => {
    const client = connect(`${host}:${port}`);
    const api = {bulk, query, queryByIds, queryOne};
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
