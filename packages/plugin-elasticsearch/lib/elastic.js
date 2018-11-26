import {flow, map, merge, property, get, getOr, set, chunk} from "lodash/fp";
import {collectP, ofP} from "dashp";
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

export const createIndex = curry3(
  "createIndex",
  async (index, mapping, client) => {
    const body = {
      mappings: {
        _doc: {properties: mapping},
      },
    };

    if (await client.indices.exists({index})) return ofP(null);
    return client.indices.create({index, body});
  },
);

export const query = curry4(
  "query",
  async (index, body, amount, client, customMappings) => {
    const mappings = Object.assign({}, defaultMappings, customMappings);
    await createIndex(index, mappings, client);

    let allData = [];
    let meta = {took: 0, total: 0};
    const responseQueue = [];

    responseQueue.push(
      await client.search({
        index,
        body,
        size: 250,
        scroll: "30s",
        requestTimeout: "90000",
      }),
    );

    while (responseQueue.length) {
      const response = responseQueue.shift();

      allData = allData.concat(
        map(u => {
          const source = flow([property("_source"), unstripify])(u);
          return Object.assign(
            {},
            source,
            {_sc_elastic_score: get("_score", u)},
            get("highlight", u)
              ? {
                  _sc_elastic_highlights: flow([get("highlight"), unstripify])(
                    u,
                  ),
                }
              : {},
          );
        }, get("hits.hits", response)),
      );

      meta = Object.assign(
        {},
        meta,
        response.timed_out ? {timedOut: true} : {},
        {
          took: get("took", response) + meta.took,
          total: get("hits.total", response),
        },
      );

      if (
        response.hits.total === allData.length ||
        (amount != null && amount >= allData.length)
      ) {
        break;
      }
      responseQueue.push(
        // eslint-disable-next-line no-await-in-loop
        await client.scroll({
          scrollId: response._scroll_id,
          scroll: "30s",
        }),
      );
    }

    return [allData, meta];
  },
);

export const bulk = curry4(
  "bulk",
  async (index, ops, client, customMappings) => {
    const batchSize = 500;
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

    const mappings = Object.assign({}, defaultMappings, customMappings);

    await createIndex(index, mappings, client);
    const responses = await collectP(
      body => client.bulk({body, type: "_doc", refresh: true}),
      chunk(batchSize, toIndex.concat(toUpdate)),
    );

    return responses.reduce(
      ([errors, meta], response) => {
        const {took, items} = response;
        return items.reduce(
          (acc, item) => {
            const i = item.index || item.update;
            const path = `${i._index}.${i.result}`;
            const count = getOr(0, path, acc[1]);
            return [
              i.error ? acc[0].concat([{id: i._id, error: i.error}]) : acc[0],
              merge(acc[1], set(path, count + 1, {})),
            ];
          },
          [errors, Object.assign({}, meta, {took: meta.took + took})],
        );
      },
      [[], {took: 0, batches: responses.length, batchSize}],
    );
  },
);

export const queryByIds = curry3("queryByIds", async (index, ids, client) => {
  const batchSize = 500;
  const responses = await collectP(idsChunk => {
    const body = queries.byIds(idsChunk);
    return query(index, body, idsChunk.length, client);
  }, chunk(batchSize, ids));

  return responses.reduce(
    ([data, meta], response) => {
      const {took, total} = response[1];
      return [
        data.concat(response[0]),
        Object.assign({}, meta, {
          took: took + meta.took,
          total: total + meta.total,
        }),
      ];
    },
    [[], {took: 0, total: 0, batches: responses.length, batchSize}],
  );
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
