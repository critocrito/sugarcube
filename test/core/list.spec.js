import {
  cloneDeep as clone,
  every,
  merge,
  identity,
  has,
  isEqual,
} from "lodash/fp";
import jsc, {property} from "jsverify";

import list from "../../packages/core/lib/data/list";
import {listArb, listsArb} from "../../packages/test/lib";

const {
  emptyOne,
  equalsOne,
  identicalOne,
  concatOne,
  empty,
  equals,
  concat,
  fmap,
  uniq,
  hashOne,
  hash,
} = list;

const isTrue = isEqual(true);

describe("list interface", () => {
  property("reflexivity of equality", listArb, (h) =>
    isTrue(equalsOne(h, clone(h))),
  );

  property("symmetry of equality", listArb, (h) =>
    isEqual(equalsOne(h, clone(h)), equalsOne(clone(h), h)),
  );

  property("transitivity of equality", listArb, (h) => {
    const j = clone(h);
    const k = clone(h);
    return equalsOne(h, j) && equalsOne(j, k) && equalsOne(h, k);
  });

  property("associativity of a monoid", listArb, listArb, listArb, (h, j, k) =>
    equalsOne(concatOne(concatOne(h, j), k), concatOne(h, concatOne(j, k))),
  );

  property("right identity of a Monoid", listArb, (h) =>
    identicalOne(concatOne(h, emptyOne()), h),
  );

  property("left identity of a Monoid", listArb, (h) =>
    equalsOne(concatOne(emptyOne(), h), h),
  );
});

describe("lists interface", () => {
  property("reflexivity of equality", listsArb, (xs) =>
    isTrue(equals(xs, clone(xs))),
  );

  property("symmetry of equality", listsArb, (xs) =>
    isEqual(equals(xs, clone(xs)), equals(clone(xs), xs)),
  );

  property("transitivity of equality", listsArb, (xs) => {
    const ys = clone(xs);
    const zs = clone(xs);
    return equals(xs, ys) && equals(ys, zs) && equals(xs, zs);
  });

  property(
    "associativity of a semigroup",
    listsArb,
    listsArb,
    listsArb,
    (xs, ys, zs) =>
      equals(concat(concat(xs, ys), zs), concat(xs, concat(ys, zs))),
  );

  property("right identity of a Monoid", listsArb, (xs) =>
    equals(concat(xs, empty()), uniq(xs)),
  );

  property("left identity of a Monoid", listsArb, (xs) =>
    equals(concat(empty(), xs), uniq(xs)),
  );

  property("identity of a Functor", listsArb, (xs) =>
    equals(fmap(identity, xs), xs),
  );

  property(
    "composition of a Functor",
    listsArb,
    jsc.dict(jsc.string),
    jsc.dict(jsc.string),
    (xs, a, b) => {
      const f = merge(a);
      const g = merge(b);
      return equals(
        fmap((z) => f(g(z)), xs),
        fmap(f, fmap(g, xs)),
      );
    },
  );
});

describe("lists hashing", () => {
  property("hashes a single list", listArb, (h) =>
    has("_sc_id_hash", hashOne(h)),
  );

  property("hashes many lists", listsArb, (xs) =>
    every(has("_sc_id_hash"), hash(xs)),
  );
});
