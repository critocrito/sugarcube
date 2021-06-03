import {map, reduce, merge, constant, uniqBy, isEqual} from "lodash/fp";
import {collectP} from "dashp";

import {arrayify, concatManyWith, equalsManyWith} from "../utils";
import {hashKeys} from "../crypto";

const hashListId = hashKeys(["type", "term"]);

const listId = (l) => l._sc_id_hash || hashListId(l);

// A single List
// Setoid
const equalsOne = (a, b) => isEqual(listId(a), listId(b));
const identicalOne = (a, b) => isEqual(a, b);

// Monoid
const emptyOne = constant({});
const concatOne = (a, b) => merge(a, b);

// A list of lists
// Setoid
const equals = (a, b) => equalsManyWith(equalsOne, a, b);
const identical = (a, b) => equalsManyWith(identicalOne, a, b);

// Monoid
const empty = constant([]);
const concat = (a, b) => concatManyWith(listId, concatOne, a, b);

// Functor
const fmap = (g, xs) => xs.map(g);
const fmapAsync = (g, xs) => collectP(g, xs);

// Applicative
const pure = arrayify;
const apply = (fs, xs) => map((x) => reduce((memo, f) => f(memo), x, fs), xs);

// Combinators
const filter = (g, xs) => xs.filter(g);
const uniq = (xs) => uniqBy(listId, xs);

// Hashing
const hashOne = (h) => concatOne(h, {_sc_id_hash: listId(h)});
const hash = (xs) => fmap(hashOne, xs);

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
