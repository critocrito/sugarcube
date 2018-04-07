import {map, take, concat, merge, identity} from "lodash/fp";
import {
  constant,
  elements,
  random,
  array,
  dict,
  string,
  record,
  nestring,
  suchthat,
} from "jsverify";

import {data as ds, queries as qs} from "@sugarcube/core";

const trueOrFalse = () => random(0, 1) === 0;

export const objArb = suchthat(dict(string), o =>
  Object.keys(o).reduce((memo, k) => {
    if (!memo) return memo;
    // Skip undefined and empty strings
    if (!k) return false;
    // Forbid unicode control characters and spaces
    // eslint-disable-next-line no-control-regex
    if (/[\u0000-\u0020]/u.test(k)) return false;
    // Disallow certain keys
    if (/^-+|_+/.test(k)) return false;
    // Keys don't start with white space
    if (/^\s*/.test(k)) return false;
    return true;
  }, true),
);

const generate = (arb, len) => {
  const l = len || random(0, 5);
  let xs = [];
  while (xs.length < l) {
    xs = concat(xs, arb.generator(l));
  }
  return take(l, xs);
};

const randomSpec = () => {
  switch (random(0, 5)) {
    case 0: {
      return {[nestring.generator(2)]: objArb};
    }
    case 1: {
      return {[nestring.generator(2)]: array(string)};
    }
    case 2: {
      return {[nestring.generator(2)]: record(randomSpec())};
    }
    default: {
      return {[nestring.generator(2)]: string};
    }
  }
};

const type = elements(["type1", "type2", "type3"]);
const term = nestring;

/**
 * An arbitrary that can be used in `jsverify` based property tests.
 * It produces a single object that resembles a list.
 */
export const listArb = record(merge({type, term}, randomSpec()));

/**
 * An arbitrary that can be used in `jsverify` based property tests.
 * It produces an array of objects, where each object is a list.
 */
export const listsArb = array(listArb).smap(qs.uniq, identity);

/**
 * Randonly generate a list of lists.
 * @param {number} size The number of lists to generate.
 * @returns {Array.<Object>} A list of list objects.
 */
export const lists = size => generate(listsArb, size);

/**
 * An arbitrary that can be used in `jsverify` based property tests.
 * It produces a single object that resembles a query.
 */
export const queryArb = listArb;

/**
 * An arbitrary that can be used in `jsverify` based property tests.
 * It produces an array of objects, where each object is a list.
 */
export const queriesArb = listsArb;

/**
 * Randonly generate a list of queries.
 * @param {number} size The number of queries to generate.
 * @returns {Array.<Object>} A list of queries.
 */
export const queries = size => generate(queriesArb, size);

const dataUnitSpec = {
  field1: nestring,
  field2: nestring,
  _sc_id_fields: constant(["field1", "field2"]),
  _sc_media: listsArb,
  _sc_relations: listsArb,
  _sc_downloads: listsArb,
  _sc_queries: listsArb,
  _sc_markers: array(string),
};

/**
 * An arbitrary that can be used in `jsverify` based property tests.
 * It produces a single object that resembles a unit of data.
 */
export const unitArb = record(merge(dataUnitSpec, randomSpec()));

/**
 * Randomly generate a single unit of data.
 * @returns {Object} A unit of data.
 */
export const unit = () => unitArb.generator(random(0, 5));

/**
 * An arbitrary that can be used in `jsverify` based property tests.
 * It produces an array of objects, where each object is a unit of data.
 */
export const dataArb = array(unitArb)
  .smap(ds.uniq, identity)
  .smap(
    map(x => (trueOrFalse() ? merge(x, {_sc_id_hash: ds.dataId(x)}) : x)),
    identity,
  );

/**
 * Randonly generate units of data..
 * @param {number} size The number of data units to generate.
 * @returns {Array.<Object>} A list of data units.
 */
export const data = size => generate(dataArb, size);

/**
 * An arbitrary that can be used in `jsverify` based property tests.
 * It produces an object that is an envelope..
 */
export const envelopeArb = record({data: dataArb, queries: queriesArb});

/**
 * Randomly generate a envelope with data and queries.
 * @param {number} sizeData The number of data units in the envelope.
 * @param {number} sizeQueries The number of queries in the envelope.
 * @returns {Object} A unit of data.
 */
export const envelope = (sizeData, sizeQueries) => ({
  data: data(sizeData || random(0, 5)),
  queries: queries(sizeQueries || random(0, 5)),
});

export default {
  objArb,
  queriesArb,
  queries,
  listArb,
  listsArb,
  lists,
  unitArb,
  unit,
  dataArb,
  data,
  envelopeArb,
  envelope,
};
