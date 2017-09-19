import {
  curry,
  map,
  reduce,
  filter as loFilter,
  merge,
  constant,
  uniqBy,
  isEqual,
} from "lodash/fp";

import {arrayify, concatManyWith, equalsManyWith} from "../utils";
import {hashKeys} from "../utils/hasher";
import {mapP} from "../utils/combinators";

const hashListId = hashKeys(["type", "term"]);

const listId = l => l._lf_id_hash || hashListId(l);

// A single List
// Setoid
const equalsOne = curry((a, b) => isEqual(listId(a), listId(b)));
const identicalOne = isEqual;

// Monoid
const emptyOne = constant({});
const concatOne = merge;

// A list of lists
// Setoid
const equals = equalsManyWith(equalsOne);
const identical = equalsManyWith(identicalOne);

// Monoid
const empty = constant([]);
const concat = concatManyWith(listId, equalsOne, concatOne);

// Functor
const fmap = map;
const fmapAsync = mapP;

// Applicative
const pure = arrayify;
const apply = (fs, xs) => map(x => reduce((memo, f) => f(memo), x, fs), xs);

// Combinators
const filter = loFilter;
const uniq = uniqBy(listId);

// Hashing
const hashOne = h => concatOne(h, {_lf_id_hash: listId(h)});
const hash = fmap(hashOne);

export default {
  listId,

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
  pure,
  apply,

  filter,
  uniq,

  hashOne,
  hash,
};
