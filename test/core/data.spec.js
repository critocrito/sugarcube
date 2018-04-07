import {
  flow,
  cloneDeep as clone,
  every,
  identity,
  merge,
  has,
  isMatch,
  isEqual,
} from "lodash/fp";
import {of} from "dashp";
import jsc, {property} from "jsverify";

import {data, queries as list} from "../../packages/core/lib";
import {unitArb, dataArb} from "../../packages/test/lib";

const {
  emptyOne,
  equalsOne,
  identicalOne,
  concatOne,
  empty,
  equals,
  identical,
  concat,
  fmap,
  fmapAsync,
  fmapList,
  fmapListAsync,
  uniq,
  hashOne,
  hash,
} = data;

const isTrue = isEqual(true);

describe("data unit interface", () => {
  property("reflexivity of identity equality", unitArb, u =>
    isTrue(equalsOne(u, clone(u))),
  );

  property("symmetry of identity equality", unitArb, u =>
    isEqual(equalsOne(u, clone(u)), equalsOne(clone(u), u)),
  );

  property("transitivity of identity equality", unitArb, u => {
    const j = clone(u);
    const k = clone(u);
    return equalsOne(u, j) && equalsOne(j, k) && equalsOne(u, k);
  });

  property("reflexivity of value equality", unitArb, u =>
    isTrue(identicalOne(u, clone(u))),
  );

  property("symmetry of value equality", unitArb, u =>
    isEqual(identicalOne(u, clone(u)), identicalOne(clone(u), u)),
  );

  property("transitivity of value equality", unitArb, u => {
    const j = clone(u);
    const k = clone(u);
    return identicalOne(u, j) && identicalOne(j, k) && identicalOne(u, k);
  });

  property("associativity of a monoid", unitArb, unitArb, unitArb, (u, j, k) =>
    equalsOne(concatOne(concatOne(u, j), k), concatOne(u, concatOne(j, k))),
  );

  property("right identity of a Monoid", unitArb, u =>
    equalsOne(concatOne(u, emptyOne()), u),
  );

  property("left identity of a Monoid", unitArb, u =>
    equalsOne(concatOne(emptyOne(), u), u),
  );
});

describe("data interface", () => {
  property("reflexivity of identity equality", dataArb, xs =>
    isTrue(equals(xs, clone(xs))),
  );

  property("symmetry of identical equality", dataArb, xs =>
    isEqual(equals(xs, clone(xs)), equals(clone(xs), xs)),
  );

  property("transitivity of identity equality", dataArb, xs => {
    const ys = clone(xs);
    const zs = clone(xs);
    return equals(xs, ys) && equals(ys, zs) && equals(xs, zs);
  });

  property("reflexivity of value equality", dataArb, xs =>
    isTrue(identical(xs, clone(xs))),
  );

  property("symmetry of value equality", dataArb, xs =>
    isEqual(identical(xs, clone(xs)), identical(clone(xs), xs)),
  );

  property("transitivity of value equality", dataArb, xs => {
    const ys = clone(xs);
    const zs = clone(xs);
    return identical(xs, ys) && identical(ys, zs) && identical(xs, zs);
  });

  property(
    "associativity of a semigroup",
    dataArb,
    dataArb,
    dataArb,
    (xs, ys, zs) =>
      equals(concat(concat(xs, ys), zs), concat(xs, concat(ys, zs))),
  );

  property("right identity of a Monoid", dataArb, xs =>
    equals(concat(xs, empty()), uniq(xs)),
  );

  property("left identity of a Monoid", dataArb, xs =>
    equals(concat(empty(), xs), uniq(xs)),
  );

  property("identity of a Functor", dataArb, xs =>
    equals(fmap(identity, xs), xs),
  );

  property(
    "composition of a Functor",
    dataArb,
    jsc.dict(jsc.string),
    jsc.dict(jsc.string),
    (xs, x, y) => {
      const f = merge(x);
      const g = merge(y);
      return equals(fmap(z => f(g(z)), xs), fmap(f, fmap(g, xs)));
    },
  );

  property("identity of an Applicative", dataArb, xs =>
    equals(data.apply(data.pure(identity), xs), xs),
  );

  property(
    "homomorphism of an Applicative",
    jsc.dict(jsc.string),
    jsc.dict(jsc.string),
    (x, y) => {
      const f = merge(y);
      const lhs = data.apply(data.pure(f), data.pure(x));
      const rhs = data.pure(f(x));
      return equals(lhs, rhs);
    },
  );

  property(
    "interchange of an Applicative",
    jsc.dict(jsc.string),
    jsc.dict(jsc.string),
    (x, y) => {
      const u = data.pure(merge(y));
      const lhs = data.apply(u, data.pure(x));
      const rhs = data.apply(data.pure(f => f(x)), u);
      return equals(lhs, rhs);
    },
  );

  property(
    "composition of an Applicative",
    dataArb,
    jsc.dict(jsc.string),
    jsc.dict(jsc.string),
    (xs, x, y) => {
      const comp = f => g => z => f(g(z));
      const u = data.pure(merge(x));
      const v = data.pure(merge(y));
      const lhs = data.apply(data.apply(data.apply(data.pure(comp), u), v), xs);
      const rhs = data.apply(u, data.apply(v, xs));
      return equals(lhs, rhs);
    },
  );

  describe("fmap and fmapAsync", () => {
    property(
      "maps a function over a list of unit",
      dataArb,
      jsc.dict(jsc.string),
      (xs, x) => {
        const f = y => concatOne(y, x);
        return every(isMatch(x), fmap(f, xs));
      },
    );

    property(
      "overloaded fmapAsync to allow two type signatures",
      dataArb,
      jsc.dict(jsc.string),
      async (xs, x) => {
        const f = y => concatOne(y, x);
        const p = flow([f, of]);
        return equals(await fmapAsync(f, xs), await fmapAsync(p, xs));
      },
    );

    property(
      "produces the same results synchronously and asynchronously",
      dataArb,
      jsc.dict(jsc.string),
      async (xs, x) => {
        const f = y => concatOne(y, x);
        return equals(fmap(f, xs), await fmapAsync(f, xs));
      },
    );
  });

  describe("fmapList and fmapListAsync", () => {
    property("maps a function over a list on units of data", dataArb, xs => {
      const obj = {[Symbol("key")]: Symbol("value")};
      const f = y => list.concatOne(y, obj);
      const ys = fmapList("_sc_downloads", f, xs);
      return every(isMatch(obj), ys._sc_downloads);
    });

    property(
      "produces the same results synchronously and asynchronously",
      dataArb,
      async xs => {
        const obj = {[Symbol("key")]: Symbol("value")};
        const f = y => list.concatOne(y, obj);
        return equals(
          fmapList("_sc_downloads", f, xs),
          await fmapListAsync("_sc_downloads", f, xs),
        );
      },
    );
  });
});

describe("data hashing", () => {
  property("hashes a single unit", unitArb, u =>
    has("_sc_id_hash", hashOne(u)),
  );

  property("hashes many homonyms", dataArb, xs => {
    const hs = hash(xs);
    return every(has("_sc_id_hash"), hs) && every(has("_sc_content_hash"), hs);
  });
});
