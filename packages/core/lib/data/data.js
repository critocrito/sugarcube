import {
  reduce,
  keys,
  get,
  merge,
  mergeAll,
  uniq as loUniq,
  uniqBy,
  constant,
  concat as loConcat,
  isEqual,
  isString,
  isArray,
} from "lodash/fp";

import ls from "./list";
import {now, curry2, curry3, concatManyWith, equalsManyWith} from "../utils";
import {hashWithField} from "../crypto";

const listFields = [
  "_sc_relations",
  "_sc_media",
  "_sc_downloads",
  "_sc_queries",
];

const hashUnitId = hashWithField("_sc_id_fields");
const hashUnitContent = hashWithField("_sc_content_fields");

const dataId = u => u._sc_id_hash || hashUnitId(u);
const contentId = u => u._sc_content_hash || hashUnitContent(u);

/**
 * A Unit is an object containing a discrete piece of
 *
 * Units have an equivalence relation and form therefore a setoid. They
 * provide an associative binary operation and an element and therefore form a
 * monoid.
 *
 * @typedef {Object} Unit
 * @property {string} _sc_id_hash The unique identifier of this unit.
 * @property {Array.<string>} _sc_markers A list of run markers.
 * @property {Array.<Object>} _sc_relations A list of relations.
 * @property {Array.<Object>} _sc_media A list of media entities.
 * @property {Array.<Object>} _sc_downloads A list of downloads.
 * @property {Array.<Object>} _sc_queries A list of queries.
 * @property {Object} _sc_pubdates Various dates collected around this unit.
 * @property {Date} _sc_pubdates.fetch The time and date at the moment this
 * unit was created.
 * @property {Array.<string>} [_sc_id_fields] A list of fields that form the
 * unique identifier.
 * @property {string} [_sc_content_hash] The value of the unit.
 * @property {Array.<string>} [_sc_content_fields] A list of fields that form
 * the value of the unit.
 */

/**
 * Data is a list of units.
 *
 * Data has an equivalence relation and forms therefore a setoid. It provides
 * an associative binary operation and an element and therefore forms a
 * monoid. It can also map between two categaories and form a structure
 * preserving functor.
 *
 * @typedef {Array.<Unit>} Data
 */

/**
 * Compare two units for identity equality. This means two units have the same
 * identifier as opposed to value identity.
 *
 * `equalsOne :: (Setoid a, Unit a) => a -> a -> Bool`
 * @param {Unit} a The first unit to compare.
 * @param {Unit} b The second unit to compare.
 * @returns {boolean} Returns `true` if the two units have the same identity,
 * otherwise `false`.
 */
const equalsOne = curry2("equalsOne", (a, b) => isEqual(dataId(a), dataId(b)));
/**
 * Compare two units for value equality. This means two units have the same
 * value.
 *
 * * `identicalOne :: (Setoid a, Unit a) => a -> a -> Bool`
 * @param {Unit} a The first unit to compare.
 * @param {Unit} b The second unit to compare.
 * @returns {boolean} Returns `true` if the two units are idenitical,
 * otherwise `false`.
 */
const {identicalOne} = ls;

/**
 * Create an empty unit. This forms the identity element for a monoid.
 *
 * `emptyOne :: (Monoid a, Unit a) => a`
 * @returns {Unit} An empty unit.
 */
const emptyOne = () => {
  const dates = {_sc_pubdates: {fetch: now()}};
  const markers = {_sc_markers: []};
  const lists = reduce(
    (memo, h) => merge(memo, {[h]: ls.empty()}),
    {},
    listFields,
  );

  return mergeAll([dates, markers, lists]);
};

/**
 * Concatenate two units, which merges them into one single unit. This
 * provides the binary associative operation under a monoid. The target unit
 * takes precedence over the source unit when merging.
 *
 * `concatOne :: (Monoid a, Unit a) => a -> a -> a`
 * @param {Unit} a The source unit to merge.
 * @param {Unit} b The target unit to merge.
 * @return {Unit} The result of concatenationg b into a.
 */
const concatOne = curry2("concatOne", (a, b) => {
  const lists = reduce(
    (memo, h) =>
      merge(memo, {[h]: ls.concat(a[h] || ls.empty(), b[h] || ls.empty())}),
    {},
    listFields,
  );
  const markers = {
    _sc_markers: loUniq(loConcat(a._sc_markers || [], b._sc_markers || [])),
  };

  // the fetch date must be either a date object or an ISO8601 date
  // string. Those string work the same in the lesser than clause.
  let dates = {};
  if (get("_sc_pubdates.fetch", a) && get("_sc_pubdates.fetch", b)) {
    const leftDate = new Date(a._sc_pubdates.fetch);
    const rightDate = new Date(b._sc_pubdates.fetch);
    dates =
      leftDate <= rightDate
        ? {_sc_pubdates: {fetch: a._sc_pubdates.fetch}}
        : {};
  }

  // concat {a: "string"} and {a: ["other"]} into {a: ["string", "other"]}
  const stringArrays = keys(a).reduce((memo, k) => {
    if (!b[k]) return memo;
    if ((isArray(a[k]) && isString(b[k])) || (isString(a[k]) && isArray(b[k])))
      return merge(memo, {[k]: loUniq([].concat(a[k]).concat(b[k]))});
    return memo;
  }, {});

  return mergeAll([a, b, stringArrays, dates, lists, markers]);
});

/**
 * Calculate the hashes for identity, content and the element of the list
 * fields.
 *
 * `hashOne :: Unit a => a -> a`
 * @param {Unit} u A single unit of data.
 * @returns {Unit} The same unit as on input, but with hashes calculated.
 */
const hashOne = u => {
  const hashes = reduce(
    (memo, h) => merge(memo, {[h]: ls.hash(u[h])}),
    {_sc_id_hash: dataId(u), _sc_content_hash: contentId(u)},
    listFields,
  );
  return concatOne(u, hashes);
};

/**
 * Test two lists of units for identity equality. They are equal if they both
 * have the same length, and each unit has the same identity as the other unit
 * at the same index.
 *
 * `equals :: (Setoid s, Unit a) => s [a] -> s [a] -> Bool`
 * @param {Data} a The first list of units to compare.
 * @param {Data} b The second list of units to compare.
 * @returns {boolean} Returns `true` if both lists of units are equal,
 * otherwise `false`.
 */
const equals = curry3("equals", (f, a, b) => f(a, b))(
  equalsManyWith(equalsOne),
);
/**
 * Test two lists of units for value equality. They are equal if each unit is
 * equivalent to the other unit at the same index.
 *
 * `identical :: (Setoid s, Unit a) => s [a] -> s [a] -> Bool`
 * @param {Data} a The first list of units to compare.
 * @param {Data} b The second list of units to compare.
 * @returns {boolean} Returns `true` if both lists of units have equal value,
 * otherwise `false`.
 */
const identical = curry3("identical", (f, a, b) => f(a, b))(
  equalsManyWith(identicalOne),
);

/**
 * Create an empty list of units. This forms the identity element for a
 * monoid.
 *
 * `empty :: Monoid m => m []`
 * @returns {Data} An empty list of units.
 */
const empty = constant([]);

/**
 * Concatenate two list of units. Equal units are merged, new units are
 * appended. This provides the binary associative operation under a monoid.
 * Units with equal identities in the same list are not merged.  One dissappears
 *
 * `concat :: (Monoid m, Unit a) => m [a] -> m [a] -> m [a]`
 * @param {Unit} a The source unit to merge.
 * @param {Unit} b The target unit to merge.
 * @return {Unit} The result of concatenationg b into a.
 */
const concat = curry3("concat", (f, a, b) => f(a, b))(
  concatManyWith(dataId, equalsOne, concatOne),
);

/**
 * Map a function over a list of units. This is equivalent as `Array.map`.
 *
 * `fmap :: (Functor f, Unit a) => (a -> b) -> f a -> f b`
 * @param {Function} f The function to map over the list of units.
 * @param {Data} a The list of units.
 * @returns {Data} The result list of every unit applied to `f`.
 */
const {fmap} = ls;

/**
 * The asynchronous version of `fmap`. The function to map over can either
 * return a value or the promise for one.
 *
 * `fmapAsync :: (Functor f, Unit a) => (a -> Future b) -> f a -> Future (f b)`
 *
 * `fmapAsync :: (Functor f, Unit a) => (a -> b) -> f a -> Future (f b)`
 * @param {Function} f The function to map over the list of units. This
 * function can either return a value, or a promise of a value.
 * @param {Data} a The list of units.
 * @returns {Promise.<Data>} The result list of every unit applied to `f`.
 */
const {fmapAsync} = ls;

/**
 * Map a function over the list of a data unit. The original unit is
 * returned, only a single list was mapped over a function.
 *
 * `fmapList :: (Functor f, Unit a) => String -> (a -> b) -> f a -> f b`
 * @param {string} field The name of the list on unit that should be
 * mapped.
 * @param {Function} f The function to map over the list.
 * @param {Data} xs The list of units.
 * @returns {Data} The list of units, where a single list of the unit was
 * mapped over `f`.
 * @example
 * // Returns xs with f applied to every element of `_sc_downloads`.
 * xs = generator(10);
 * const f = doSomethingWithAnObject;
 * fmapList('_sc_downloads', f, xs);
 */
const fmapList = curry3("fmapList", (field, f, xs) =>
  fmap(u => concatOne(u, {[field]: ls.fmap(f, u[field])}), xs),
);

/**
 * The asynchronous version of `fmapList`. The function to map over can
 * either return a value or the promise for one.
 *
 * `fmapListAsync :: (Functor f, Unit a) => String -> (a -> Future b) -> f a -> Future (f b)`
 *
 * `fmapListAsync :: (Functor f, Unit a) => String -> (a -> b) -> f a -> Future (f b)`
 * @param {string} field The name of the list on unit that should be
 * mapped.
 * @param {Function} f The function to map over the list. This function can
 * either return a value, or a promise of a value.
 * @param {Data} a The list of units.
 * @returns {Promise.<Data>} The result list of every unit applied to `f`.
 */
const fmapListAsync = curry3("fmapListAsync", (field, f, xs) =>
  fmapAsync(
    u => ls.fmapAsync(f, u[field]).then(ys => concatOne(u, {[field]: ys})),
    xs,
  ),
);

/**
 * `fmapList` specialized for `_sc_relations`.
 */
const fmapRelations = curry3("fmapRelations", (f, g, xs) => f(g, xs))(
  fmapList("_sc_relations"),
);
/**
 * The asynchronous version of `fmapRelations`.
 */
const fmapRelationsAsync = curry3("fmapRelationsAsync", (f, g, xs) => f(g, xs))(
  fmapListAsync("_sc_relations"),
);

/**
 * `fmapList` specialized for `_sc_media`.
 */
const fmapMedia = curry3("fmapMedia", (f, g, xs) => f(g, xs))(
  fmapList("_sc_media"),
);
/**
 * The asynchronous version of `fmapMedia`.
 */
const fmapMediaAsync = curry3("fmapMediaAsync", (f, g, xs) => f(g, xs))(
  fmapListAsync("_sc_media"),
);

/**
 * `fmapList` specialized for `_sc_downloads`.
 */
const fmapDownloads = curry3("fmapDownloads", (f, g, xs) => f(g, xs))(
  fmapList("_sc_downloads"),
);
/**
 * The asynchronous version of `fmapDownloads`.
 */
const fmapDownloadsAsync = curry3("fmapDownloadsAsync", (f, g, xs) => f(g, xs))(
  fmapListAsync("_sc_downloads"),
);

/**
 * `fmapList` specialized for `_sc_queries`.
 */
const fmapQueries = curry3("fmapQueries", (f, g, xs) => f(g, xs))(
  fmapList("_sc_queries"),
);
/**
 * The asynchronous version of `fmapQueries`.
 */
const fmapQueriesAsync = curry3("fmapQueriesAsync", (f, g, xs) => f(g, xs))(
  fmapListAsync("_sc_queries"),
);

// Applicative
const {pure, apply} = ls;

// Combinators
/**
 * Filter a list of units by a predicate. This is equivalent to
 * `Array.filter`.
 *
 * `filter :: Unit a => (a -> Bool) -> [a] -> [a]`
 * @param {Function} f The predicate to filter the list of units.
 * @param {Data} xs The list of units.
 * @returns {Data} A list of units, which passed the predicate test.
 */
const {filter} = ls;

/**
 * Remove duplicate units in a list of units. Identity is based on
 *
 * `_sc_id_hash`.
 * `uniq :: Unit a => [a] -> [a]`
 * @param {Data} xs The list of units.
 * @returns {Data} A list of units with duplicates removed.
 */
const uniq = xs => uniqBy(dataId, xs);

/**
 * Calculate hashes for every unit of data in a list.
 *
 * `hash :: (Unit a) => [a] -> [a]`
 * @param {Data} xs A list of units.
 * @returns {Data} A list of units, with hashes calculated for every unit.
 */
const hash = xs => fmap(hashOne, xs);

export default {
  listFields,
  dataId,
  contentId,

  equalsOne,
  identicalOne,
  emptyOne,
  concatOne,

  equals,
  identical,
  empty,
  concat,
  fmap,
  fmapAsync,
  fmapList,
  fmapListAsync,
  fmapDownloads,
  fmapDownloadsAsync,
  fmapRelations,
  fmapRelationsAsync,
  fmapMedia,
  fmapMediaAsync,
  fmapQueries,
  fmapQueriesAsync,

  pure,
  apply,
  filter,
  uniq,

  hashOne,
  hash,
};
