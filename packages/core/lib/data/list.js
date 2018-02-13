import {
  map,
  reduce,
  filter as loFilter,
  merge,
  constant,
  uniqBy,
  isEqual,
} from "lodash/fp";
import {collectP} from "dashp";

import {curry3, arrayify, concatManyWith, equalsManyWith} from "../utils";
import {hashKeys} from "../crypto";

const hashListId = hashKeys(["type", "term"]);

const listId = l => l._sc_id_hash || hashListId(l);

// A single List
// Setoid
const equalsOne = curry3("equalsOne", (f, a, b) => f(listId(a), listId(b)))(
  isEqual
);
const identicalOne = curry3("identicalOne", (f, a, b) => f(a, b))(isEqual);

// Monoid
const emptyOne = constant({});
const concatOne = curry3("concatOne", (f, a, b) => f(a, b))(merge);

// A list of lists
// Setoid
const equals = curry3("equals", (f, a, b) => f(a, b))(
  equalsManyWith(equalsOne)
);
const identical = curry3("identical", (f, a, b) => f(a, b))(
  equalsManyWith(identicalOne)
);

// Monoid
const empty = constant([]);
const concat = curry3("concat", (f, a, b) => f(a, b))(
  concatManyWith(listId, equalsOne, concatOne)
);

// Functor
const fmap = curry3("fmap", (f, g, xs) => f(g, xs))(map);
const fmapAsync = curry3("fmapAsync", (f, g, xs) => f(g, xs))(collectP);

// Applicative
const pure = arrayify;
const apply = (fs, xs) => map(x => reduce((memo, f) => f(memo), x, fs), xs);

// Combinators
const filter = curry3("filter", (f, g, xs) => f(g, xs))(loFilter);
const uniq = xs => uniqBy(listId, xs);

// Hashing
const hashOne = h => concatOne(h, {_sc_id_hash: listId(h)});
const hash = xs => fmap(hashOne, xs);

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
