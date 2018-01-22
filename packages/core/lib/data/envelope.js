import {
  flow,
  curry,
  map,
  flatMap,
  differenceWith,
  intersectionWith,
  property,
  identity,
  isEqual,
} from "lodash/fp";
import {spreadP, collectP} from "dashp";

import ls from "./list";
import ds from "./data";

/**
 * Queries are a list of questions.
 * @typedef {Array.<Object>} Queries
 */

/**
 * Envelopes wrap around data and queries.
 *
 * Envelopes have an equivalence relation and form therefore a setoid. They
 * provide an associative binary operation and an identity element and
 * therefore form a monoid. They further implement the interface for functors.
 *
 * @typedef {Object} Envelope
 * @property {Data} data A list of units of this envelope.
 * @property {Queries} queries A list of queries of this envelope.
 */

/**
 * Construct a new envelope.
 *
 * `envelope :: (Data a, Queries b) => a -> b -> Envelope`
 * @param {Data} data A list of units.
 * @param {Queries} queries A list of queries.
 * @returns {Envelope} A new envelope constructed from `data` and `queries`.
 */
export const envelope = curry((data, queries) => ({data, queries}));
/**
 * Like `envelope`, but only data has to be provided. Queries are empty.
 */
export const envelopeData = data => ({data, queries: ls.empty()});
/**
 * Like `envelope`, but only queries have to be provided. Data is empty.
 */
export const envelopeQueries = queries => ({data: ds.empty(), queries});

/**
 * Test two Envelopes for equality. Two envelopes are regarded as equals if
 * each, data and queries, are equal.
 *
 * `equals :: (Setoid s, Env a) => s a -> s a -> Bool`
 * @param {Envelope} a The first envelope to compare.
 * @param {Envelope} b The second envelop to compare.
 * @returns {boolean} Returns `true` if both envelopes are equal, otherwise
 * `false`.
 */
export const equals = curry(
  (e1, e2) => ds.equals(e1.data, e2.data) && ls.equals(e1.queries, e2.queries)
);
/**
 * Like `equals`, but only the equality `data` is compared.
 */
export const equalsData = curry((e1, e2) => ds.equals(e1.data, e2.data));
/**
 * Like `equals`, but only the equality `queries` is compared.
 */
export const equalsQueries = curry((e1, e2) =>
  ls.equals(e1.queries, e2.queries)
);

/**
 * Create an empty envelope, which contains one empty `data` field and one
 * empty `queries` field. This forms the identity element for a monoid.
 *
 * `empty :: Monoid m => m []`
 * @returns {Envelope} An empty envelope.
 */
export const empty = () => ({data: ds.empty(), queries: ls.empty()});

/**
 * Concatenate two envelopes. This concatenates `data` and `queries` of each
 * envelope separately. This provides the binary associative operation under a
 * monoid. This is equivalent to an union under set theory.
 *
 * `concat :: (Monoid m, Env a) => m a -> m a -> m a`
 * @param {Envelope} a The source envelope to merge.
 * @param {Envelope} b The target envelope to merge.
 * @return {Envelope} The result of concatenationg b into a.
 */
export const concat = curry((e1, e2) => {
  const data = ds.concat(e1.data || ds.empty(), e2.data || ds.empty());
  const queries = ls.concat(e1.queries || ls.empty(), e2.queries || ls.empty());
  return envelope(data, queries);
});
export const concatLeft = curry((e1, e2) => concat(e2, e1));

/**
 * Similar to `concat`, but only concatenates data and `data` of an envelope.
 * Removes duplicate (by identity) units in the same envelope.
 *
 * `concatData :: (Monoid m, Data a, Envelope b) => m a -> m b -> m b`
 * @param {Data} a A list of units.
 * @param {Envelope} b An envelope.
 * @returns {Envelope} A new envelope with `a` concatenated into `e.data`.
 */
export const concatData = curry((data, e) => concat(e, envelopeData(data)));

/**
 * Same as `concatData`, but Prefers newer data
 */
export const concatDataLeft = curry((data, e) =>
  concatLeft(e, envelopeData(data))
);

/**
 * Same as `concatData`, but then for queries.
 */
export const concatQueries = curry((queries, e) =>
  concat(e, envelopeQueries(queries))
);

/**
 * Same as `concatQueries`, but prefers new queries
 */
export const concatQueriesLeft = curry((queries, e) =>
  concatLeft(e, envelopeQueries(queries))
);

/**
 * A union under set theory is defined as being the same as `concat`.
 */
export const union = concat;

/**
 * Intersects two envelopes under set theory and returns an envelope
 * containing all data units and queries that exist in both envelopes.
 *
 * `intersection :: (Monoid m, Env a) => m a -> m a -> m a`
 * @param {Envelope} a The source envelope to intersect.
 * @param {Envelope} b The target envelope to intersect.
 * @return {Envelope} The intersection of a and b.
 */
export const intersection = curry((e1, e2) => {
  const data = intersectionWith(
    (a, b) => ds.dataId(a) === ds.dataId(b),
    e1.data,
    e2.data
  );
  const queries = intersectionWith(
    // FIXME: Replace once id hashing for queries is introduced.
    (a, b) => a.type === b.type && a.term === b.term,
    e1.queries,
    e2.queries
  );
  return envelope(data, queries);
});

/**
 * Complements (left) two envelopes under set theory and returns an envelope
 * containing all data units and queries that are different between both
 * envelopes.
 *
 * `difference :: (Monoid m, Env a) => m a -> m a -> m a`
 * @param {Envelope} a The source envelope to complement.
 * @param {Envelope} b The target envelope to complement.
 * @return {Envelope} The left complement of a and b.
 */
export const difference = curry((e1, e2) => {
  const data = differenceWith(
    (a, b) => ds.dataId(a) === ds.dataId(b),
    e1.data,
    e2.data
  );
  const queries = differenceWith(
    // FIXME: Replace once id hashing for queries is introduced.
    (a, b) => a.type === b.type && a.term === b.term,
    e1.queries,
    e2.queries
  );
  return envelope(data, queries);
});

/**
 * Map a function over the data, and another one over queries of an envelope.
 *
 * `fmap :: (Functor f, Env a) => (x -> y) -> (v -> w) -> f a -> f a`
 * @param {Function} f A function to map over a list of units.
 * @param {Function} g A function to map over a list of queries.
 * @param {Envelope} e A envelope to map over.
 * @returns {Envelope} A result envelope with `f` mapped over `e.data` and `g`
 * mapped over `e.queries`.
 */
export const fmap = curry((f, g, e) => {
  const data = ds.fmap(f, e.data || ds.empty());
  const queries = ls.fmap(g, e.queries || ls.empty());
  return envelope(data, queries);
});
/**
 * Similar to `fmap`, but only with a single function to map over `data`.
 */
export const fmapData = curry((f, e) =>
  envelope(ds.fmap(f, e.data), e.queries)
);
/**
 * Similar to `fmap`, but only with a single function to map over `queries`.
 */
export const fmapQueries = curry((f, e) =>
  envelope(e.data, ls.fmap(f, e.queries))
);

/**
 * The asynchronous version of `fmap`. The function to map over can either
 * return a value or the promise for one.
 *
 * `fmapAsync :: (Functor f, Env a) => (x -> Future y) -> (v -> Future w) -> f a -> Future (f a)`
 *
 * `fmapAsync :: (Functor f, Env a) => (a -> b) -> f a -> Future (f b)`
 * @param {Function} f The function to map over the list of units. This
 * function can either return a value, or a promise of a value.
 * @param {Function} g The function to map over the list of queries. This
 * function can either return a value, or a promise of a value.
 * @param {Envelope} a The envelope.
 * @returns {Promise.<Envelope>} A promise for a result envelope with `f`
 * mapped over `e.data` and `g` mapped over `e.queries`.
 */
export const fmapAsync = curry((f, g, e) =>
  Promise.all([
    ds.fmapAsync(f, e.data || ds.empty()),
    ls.fmapAsync(g, e.queries || ls.empty()),
  ]).then(spreadP(envelope))
);
/**
 * Similar to `fmapAsync`, but only with a single function to map over `data`.
 */
export const fmapDataAsync = curry((f, e) =>
  ds.fmapAsync(f, e.data || ds.empty()).then(data => envelope(data, e.queries))
);
/**
 * Similar to `fmapAsync`, but only with a single function to map over `data`.
 */
export const fmapQueriesAsync = curry((f, e) =>
  ls.fmapAsync(f, e.queries || ls.empty()).then(envelope(e.data))
);

export const fmapDataList = curry((iteratee, f, e) =>
  envelope(iteratee(f, e.data), e.queries)
);
export const fmapDataListAsync = curry((iteratee, f, e) =>
  iteratee(f, e.data).then(data => envelope(data, e.queries))
);

export const fmapDataDownloads = fmapDataList(ds.fmapDownloads);
export const fmapDataDownloadsAsync = fmapDataListAsync(ds.fmapDownloadsAsync);
export const fmapDataLinks = fmapDataList(ds.fmapLinks);
export const fmapDataLinksAsync = fmapDataListAsync(ds.fmapLinksAsync);
export const fmapDataMedia = fmapDataList(ds.fmapMedia);
export const fmapDataMediaAsync = fmapDataListAsync(ds.fmapMediaAsync);
export const fmapDataRelations = fmapDataList(ds.fmapRelations);
export const fmapDataRelationsAsync = fmapDataListAsync(ds.fmapRelationsAsync);
export const fmapDataQueries = fmapDataList(ds.fmapQueries);
export const fmapDataQueriesAsync = fmapDataList(ds.fmapQueriesAsync);

// Combinators
/**
 * Filter an envelope by one predicate for data, and one for queries.
 *
 * `filter :: Env a => (x -> Bool) -> (y -> Bool) -> a -> a`
 * @param {Function} f The predicate to filter the list of units.
 * @param {Function} g The predicate to filter the list of queries.
 * @param {Envelope} e The envelope.
 * @returns {Envelope} A result envelope with `data` filtered by `f`, and
 * `queries` filtered by `g`.
 */
export const filter = curry((p1, p2, e) => {
  const data = ds.filter(p1, e.data);
  const queries = ls.filter(p2, e.queries);
  return envelope(data, queries);
});
/**
 * Similar to `filter`, but with a single predicate to filter `data`.
*/
export const filterData = curry((p, e) =>
  envelope(ds.filter(p, e.data), e.queries)
);
/**
 * Similar to `filter`, but with a single predicate to filter `queries`.
*/
export const filterQueries = curry((p, e) =>
  envelope(e.data, ls.filter(p, e.queries))
);

export const uniq = e => envelope(ds.uniq(e.data), ls.uniq(e.queries));
export const uniqData = e => envelope(ds.uniq(e.data), e.queries);
export const uniqQueries = e => envelope(e.data, ls.uniq(e.queries));

export const queriesByType = curry((type, e) => {
  const pred = flow([property("type"), isEqual(type)]);
  return flow([filterQueries(pred), property("queries"), map("term")])(e);
});

export const flatMapQueriesAsync = curry((f, source, e) =>
  collectP(
    q => f(q.term).then(ds.fmap(ds.concatOne({_sc_queries: [q]}))),
    filterQueries(({type}) => type === source, e).queries
  ).then(d => concatData(flatMap(identity, d), e))
);

export default {
  envelope,
  envelopeData,
  envelopeQueries,
  equals,
  equalsData,
  equalsQueries,
  empty,
  concat,
  concatData,
  concatDataLeft,
  concatQueries,
  concatQueriesLeft,

  difference,
  intersection,
  union,

  fmap,
  fmapAsync,
  fmapData,
  fmapDataAsync,
  fmapQueries,
  fmapQueriesAsync,
  fmapDataList,
  fmapDataListAsync,
  fmapDataDownloads,
  fmapDataDownloadsAsync,
  fmapDataLinks,
  fmapDataLinksAsync,
  fmapDataMedia,
  fmapDataMediaAsync,
  fmapDataRelations,
  fmapDataRelationsAsync,
  fmapDataQueries,
  fmapDataQueriesAsync,

  filter,
  filterData,
  filterQueries,
  uniq,
  uniqData,
  uniqQueries,
  queriesByType,
  flatMapQueriesAsync,
};
