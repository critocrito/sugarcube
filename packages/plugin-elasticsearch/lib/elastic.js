/* eslint-disable no-plusplus */
import {chunk, merge} from "lodash/fp";
import {collectP, ofP} from "dashp";
import elastic from "elasticsearch";
import {utils} from "@sugarcube/core";

import {unstripify, stripUnderscores} from "./utils";
import defaultMappings from "./mappings";
import queries from "./queries";

const {curry2, curry3, curry4, curry6} = utils;

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
    const body = mapping;

    if (await client.indices.exists({index})) return ofP(null);
    return client.indices.create({index, body});
  },
);

export const reindex = curry6(
  "reindex",
  async (index, host, port, toIndex, client, customMappings) => {
    const mappings = merge(defaultMappings, customMappings);
    await createIndex(toIndex, mappings, client);
    await client.reindex({
      body: queries.reindex(index, host, port, toIndex),
      refresh: true,
      waitForCompletion: false,
    });
    return [null, {}];
  },
);

export const query = curry4(
  "query",
  async (index, body, amount, client, customMappings) => {
    const mappings = merge(defaultMappings, customMappings);
    await createIndex(index, mappings, client);

    const allData = [];
    let meta = {took: 0, total: 0};
    const responseQueue = [];

    responseQueue.push(
      await client.search({
        index,
        body,
        size: 2000,
        scroll: "60s",
        requestTimeout: "90000",
      }),
    );

    while (responseQueue.length) {
      const response = responseQueue.shift();
      while (response.hits.hits.length) {
        const unit = response.hits.hits.shift();
        allData.push(
          Object.assign(
            unstripify(unit._source),
            {_sc_elastic_score: unit.score},
            unit.highlight != null
              ? {
                  _sc_elastic_highlights: unstripify(unit.highlight),
                }
              : {},
          ),
        );
      }

      meta = Object.assign(
        {},
        meta,
        response.timed_out ? {timedOut: true} : {},
        {
          took: meta.took + response.took,
          total: response.hits.total,
        },
      );

      if (
        (amount != null && allData.length >= amount) ||
        response.hits.total === allData.length
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
    const toIndex = [];
    const toUpdate = [];

    for (let i = 0; i < (ops.index || []).length; i++) {
      const unit = ops.index[i];
      toIndex.push({index: toHeader(index, unit)});
      toIndex.push(stripUnderscores(unit));
    }

    for (let i = 0; i < (ops.update || []).length; i++) {
      const unit = ops.update[i];
      toUpdate.push({update: toHeader(index, unit)});
      toUpdate.push({doc: stripUnderscores(unit)});
    }

    // Ensure the index is created.
    const mappings = merge(defaultMappings, customMappings);
    await createIndex(index, mappings, client);

    // Run the bulk requests
    const responseQueue = [];
    const errors = [];
    let meta = {took: 0, batches: 0, batchSize};
    const [firstChunk, ...chunks] = chunk(batchSize, toIndex.concat(toUpdate));

    responseQueue.push(
      await client.bulk({body: firstChunk, type: "_doc", refresh: true}),
    );

    while (responseQueue.length) {
      const response = responseQueue.shift();
      const {took, items} = response;

      for (let i = 0; i < (items || []).length; i++) {
        const item = items[i];
        const op = item.index || item.update || item.create || item.delete;
        const result = op.result || "error";
        const count = meta[result] || 0;

        if (op.error != null)
          errors.push({
            id: op._id,
            error: `${op.error.type}: ${op.error.reason} (${
              op.error.caused_by != null ? op.error.caused_by.reason : ""
            })`,
          });

        meta = Object.assign({}, meta, {
          took: meta.took + took,
          [result]: count + 1,
        });
      }
      if (chunks.length === 0) {
        break;
      }
      const nextChunk = chunks.shift();

      responseQueue.push(
        // eslint-disable-next-line no-await-in-loop
        await client.bulk({body: nextChunk, type: "_doc", refresh: true}),
      );
    }

    return [errors, meta];
  },
);

export const queryByIds = curry3(
  "queryByIds",
  async (index, ids, client, customMappings) => {
    const batchSize = 2500;
    const responses = await collectP(idsChunk => {
      const body = queries.byIds(idsChunk);
      return query(index, body, null, client, customMappings);
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
  },
);

export const queryOne = curry3(
  "queryOne",
  async (index, id, client, customMappings) => {
    // Ensure the index is created.
    const mappings = merge(defaultMappings, customMappings);
    await createIndex(index, mappings, client);

    const {_version: version, _type: type, _source: data} = await client.get({
      index,
      id,
      type: "_all",
    });
    return [data, {version, type}];
  },
);

export const queryExisting = curry3(
  "querryExisting",
  async (index, ids, client, customMappings) => {
    const batchSize = 5000;

    const responses = await collectP(idsChunk => {
      const body = queries.existing(idsChunk);
      return query(index, body, null, client, customMappings);
    }, chunk(batchSize, ids));

    return responses.reduce(
      ([data, meta], response) => {
        const {took, total} = response[1];
        return [
          data.concat(response[0].map(unit => unit._sc_id_hash)),
          Object.assign({}, meta, {
            took: took + meta.took,
            total: total + meta.total,
          }),
        ];
      },
      [[], {took: 0, total: 0, batches: responses.length, batchSize}],
    );
  },
);

export const Elastic = {
  Do: curry2("ElasticDo", async (G, {host, port, mappings}) => {
    const client = connect(`${host}:${port}`);
    const api = {bulk, query, queryByIds, queryOne, queryExisting, reindex};
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
