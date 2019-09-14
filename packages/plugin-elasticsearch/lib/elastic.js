/* eslint-disable no-plusplus */
import {isPlainObject, chunk} from "lodash/fp";
import {collectP, ofP} from "dashp";
import {Client as Client6} from "es6";
import {Client as Client7} from "es7";
import fetch from "node-fetch";
import {utils} from "@sugarcube/core";

import {unstripify, stripUnderscores} from "./utils";
import defaultMappings from "./mappings";
import queries from "./queries";

const {curry2, curry3, curry4, curry6} = utils;

const esVersion = async node => {
  const {version} = await fetch(node).then(resp => resp.json());
  return parseInt(version.number[0], 10);
};

const mergeMappings = async (client, customMappings = {}) => {
  const {body} = await client.info();
  const version = parseInt(body.version.number[0], 10);
  switch (version) {
    case 6: {
      return Object.assign(defaultMappings, customMappings);
    }
    case 7: {
      const {mappings, ...rest} = defaultMappings;
      return Object.assign(rest, {mappings: mappings._doc}, customMappings);
    }
    default: {
      throw new Error(`Elasticsearch version ${version} not supported.`);
    }
  }
};

// ES6 returns total as number, ES7 as an object with a value sttribute.
const normalizeTotal = body => {
  return isPlainObject(body.hits.total)
    ? body.hits.total.value
    : body.hits.total;
};

export const connect = async node => {
  let Client;
  const version = await esVersion(node);
  switch (version) {
    case 6: {
      Client = Client6;
      break;
    }
    case 7: {
      Client = Client7;
      break;
    }
    default: {
      throw new Error(`Elasticsearch version ${version} not supported.`);
    }
  }
  return new Client({node, requestTimeout: 60 * 1000});
};

export const toHeader = (index, unit) => ({
  _index: index,
  _id: unit._sc_id_hash,
});

export const toMsg = (index, unit) =>
  stripUnderscores((toHeader(index, unit), {body: unit}));

const createIndex = curry3("createIndex", async (index, mapping, client) => {
  const body = await mergeMappings(client, mapping);

  const {body: aliasExists} = await client.indices.existsAlias({name: index});
  const {body: indexExists} = await client.indices.exists({index});

  if (aliasExists || indexExists) return ofP(null);

  await client.indices.create({index: `${index}-1`, body});
  return client.indices.putAlias({index: `${index}-1`, name: index});
});

/*
 * Public API
 */
export const reindex = curry6(
  "reindex",
  async (index, host, port, toIndex, client, customMappings) => {
    await createIndex(toIndex, customMappings, client);

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
  async (index, reqBody, amount, client, customMappings) => {
    await createIndex(index, customMappings, client);

    const allData = [];
    let meta = {took: 0, total: 0};
    const responseQueue = [];

    responseQueue.push(
      await client.search({
        index,
        body: reqBody,
        size: 2000,
        scroll: "60s",
      }),
    );

    while (responseQueue.length) {
      const {body} = responseQueue.shift();
      // ES7 changed the return value of body.hits.total
      const total = normalizeTotal(body);

      while (body.hits.hits.length > 0) {
        const unit = body.hits.hits.shift();
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

      meta = Object.assign({}, meta, body.timed_out ? {timedOut: true} : {}, {
        took: meta.took + body.took,
        total,
      });

      if (
        (amount != null && allData.length >= amount) ||
        total === allData.length
      ) {
        break;
      }
      responseQueue.push(
        // eslint-disable-next-line no-await-in-loop
        await client.scroll({
          scrollId: body._scroll_id,
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
    await createIndex(index, customMappings, client);

    // Run the bulk requests
    const responseQueue = [];
    const errors = [];
    let meta = {took: 0, batches: 0, batchSize};
    const [firstChunk, ...chunks] = chunk(batchSize, toIndex.concat(toUpdate));

    responseQueue.push(
      await client.bulk({index, body: firstChunk, type: "_doc", refresh: true}),
    );

    while (responseQueue.length) {
      const {body} = responseQueue.shift();
      const {took, items} = body;

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
      const reqBody = queries.byIds(idsChunk);
      return query(index, reqBody, null, client, customMappings);
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
    await createIndex(index, customMappings, client);

    const {_version: version, _type: type, _source: data} = await client.get({
      index,
      id,
      type: "_all",
    }).body;
    return [data, {version, type}];
  },
);

export const queryExisting = curry3(
  "queryExisting",
  async (index, ids, client, customMappings) => {
    const batchSize = 5000;

    await createIndex(index, customMappings, client);

    const responses = await collectP(idsChunk => {
      const reqBody = queries.existing(idsChunk);
      return query(index, reqBody, null, client, customMappings);
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
    const node = `http://${host}:${port}`;
    const client = await connect(node);
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
