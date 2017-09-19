import {
  flow,
  curry,
  cloneDeep as clone,
  every,
  identity,
  zip,
  merge,
  sortBy,
  size,
  has,
  isMatch,
  isEqual,
} from "lodash/fp";
import Promise from "bluebird";
import {assertForall, dict, string} from "jsverify";

import {unitArb, dataArb} from "../lib/test/generators";
import ls from "../lib/data/list";
import ds from "../lib/data/data";

const isTrue = isEqual(true);
const sort = sortBy(JSON.stringify);

const legacyEquals = curry((xs, ys) => {
  const elems = zip(sortBy(ds.dataId, xs), sortBy(ds.dataId, ys));
  return (
    isEqual(size(xs), size(ys)) && every(([x, y]) => ds.equalsOne(x, y), elems)
  );
});

describe("data unit interface", () => {
  it("holds for the reflecxivity of identity equality", () =>
    assertForall(unitArb, u => isTrue(ds.equalsOne(u, clone(u)))));

  it("holds for the symmetry of identity equality", () =>
    assertForall(unitArb, u => {
      const j = clone(u);
      return isEqual(ds.equalsOne(u, j), ds.equalsOne(j, u));
    }));

  it("holds for the transitivity of identity equality", () =>
    assertForall(unitArb, u => {
      const j = clone(u);
      const k = clone(u);
      return ds.equalsOne(u, j) && ds.equalsOne(j, k) && ds.equalsOne(u, k);
    }));

  it("holds for the reflecxivity of value equality", () =>
    assertForall(unitArb, u => isTrue(ds.identicalOne(u, clone(u)))));

  it("holds for the symmetry of value equality", () =>
    assertForall(unitArb, u => {
      const j = clone(u);
      return isEqual(ds.identicalOne(u, j), ds.identicalOne(j, u));
    }));

  it("holds for the transitivity of value equality", () =>
    assertForall(unitArb, u => {
      const j = clone(u);
      const k = clone(u);
      return (
        ds.identicalOne(u, j) && ds.identicalOne(j, k) && ds.identicalOne(u, k)
      );
    }));

  // FIXME: This test takes unusually long, not sure why.
  it("holds for the associativity of a monoid", () =>
    assertForall(unitArb, unitArb, unitArb, (u, j, k) => {
      const lhs = ds.concatOne(ds.concatOne(u, j), k);
      const rhs = ds.concatOne(u, ds.concatOne(j, k));
      return ds.equalsOne(lhs, rhs);
    })).timeout(4000);

  it("holds for the right identity of a Monoid", () =>
    assertForall(unitArb, u =>
      ds.equalsOne(ds.concatOne(u, ds.emptyOne()), u)
    ));

  it("holds for the left identity of a Monoid", () =>
    assertForall(unitArb, u =>
      ds.equalsOne(ds.concatOne(ds.emptyOne(), u), u)
    ));
});

describe("data interface", () => {
  it("holds for the reflexivity of identity equality", () =>
    assertForall(dataArb, xs => isTrue(ds.equals(xs, clone(xs)))));

  it("holds for the symmetry of identical equality", () =>
    assertForall(dataArb, xs => {
      const ys = clone(xs);
      return isEqual(ds.equals(xs, ys), ds.equals(ys, xs));
    }));

  it("holds for the transitivity of identity equality", () =>
    assertForall(dataArb, xs => {
      const ys = clone(xs);
      const zs = clone(xs);
      return ds.equals(xs, ys) && ds.equals(ys, zs) && ds.equals(xs, zs);
    }));

  it("holds for the reflexivity of value equality", () =>
    assertForall(dataArb, xs => isTrue(ds.identical(xs, clone(xs)))));

  it("holds for the symmetry of value equality", () =>
    assertForall(dataArb, xs => {
      const ys = clone(xs);
      return isEqual(ds.identical(xs, ys), ds.identical(ys, xs));
    }));

  it("holds for the transitivity of value equality", () =>
    assertForall(dataArb, xs => {
      const ys = clone(xs);
      const zs = clone(xs);
      return (
        ds.identical(xs, ys) && ds.identical(ys, zs) && ds.identical(xs, zs)
      );
    }));

  it("holds for the associativity of a semigroup", () =>
    assertForall(dataArb, dataArb, dataArb, (xs, ys, zs) => {
      const lhs = ds.concat(ds.concat(xs, ys), zs);
      const rhs = ds.concat(xs, ds.concat(ys, zs));
      return ds.equals(lhs, rhs);
    }));

  it("holds for the right identity of a Monoid", () =>
    assertForall(dataArb, xs =>
      ds.equals(ds.concat(xs, ds.empty()), ds.uniq(xs))
    ));

  it("holds for the left identity of a Monoid", () =>
    assertForall(dataArb, xs =>
      ds.equals(ds.concat(ds.empty(), xs), ds.uniq(xs))
    ));

  it("holds for the identity of a Functor", () =>
    assertForall(dataArb, xs => ds.equals(ds.fmap(identity, xs), xs)));

  it("holds for the composition of a Functor", () =>
    assertForall(dataArb, dict(string), dict(string), (xs, x, y) => {
      const f = merge(x);
      const g = merge(y);
      const lhs = ds.fmap(z => f(g(z)), xs);
      const rhs = ds.fmap(f, ds.fmap(g, xs));
      return ds.equals(lhs, rhs);
    }));

  it("holds for the identity of an Applicative", () =>
    assertForall(dataArb, xs =>
      ds.equals(ds.apply(ds.pure(identity), xs), xs)
    ));

  it("holds for the homomorphism of an Applicative", () =>
    assertForall(dict(string), dict(string), (x, y) => {
      const f = merge(y);
      const lhs = ds.apply(ds.pure(f), ds.pure(x));
      const rhs = ds.pure(f(x));
      return ds.equals(lhs, rhs);
    }));

  it("holds for the interchange of an Applicative", () =>
    assertForall(dict(string), dict(string), (x, y) => {
      const u = ds.pure(merge(y));
      const lhs = ds.apply(u, ds.pure(x));
      const rhs = ds.apply(ds.pure(f => f(x)), u);
      return ds.equals(lhs, rhs);
    }));

  it("holds for the composition of an Applicative", () =>
    assertForall(dataArb, dict(string), dict(string), (xs, x, y) => {
      const comp = f => g => z => f(g(z));
      const u = ds.pure(merge(x));
      const v = ds.pure(merge(y));
      const lhs = ds.apply(ds.apply(ds.apply(ds.pure(comp), u), v), xs);
      const rhs = ds.apply(u, ds.apply(v, xs));
      return ds.equals(lhs, rhs);
    }));

  describe("fmap and fmapAsync", () => {
    it("maps a function over a list of unit", () =>
      assertForall(dataArb, dict(string), (xs, y) => {
        const f = ds.concatOne(y);
        const ys = ds.fmap(f, xs);
        return every(isMatch(y), ys);
      }));

    it("overloaded fmapAsync to allow two type signatures", () =>
      assertForall(dataArb, dict(string), (xs, y) => {
        const f = ds.concatOne(y);
        const p = flow([f, Promise.resolve]);
        return Promise.all([ds.fmapAsync(f, xs), ds.fmapAsync(p, xs)]).spread(
          ds.equals
        );
      }));

    it("produces the same results synchronously and asynchronously", () =>
      assertForall(dataArb, dict(string), (xs, y) => {
        const f = ds.concatOne(y);
        return Promise.all([
          Promise.resolve(ds.fmap(f, xs)),
          ds.fmapAsync(f, xs),
        ]).spread(ds.equals);
      }));
  });

  describe("fmapList and fmapListAsync", () => {
    it("naps a function over a list on units of data", () =>
      assertForall(dataArb, dict(string), (xs, y) => {
        const f = ls.concatOne(y);
        const ys = ds.fmapList("_lf_downloads", f, xs);
        return every(isMatch(y), ys._lf_downloads);
      }));

    it("produces the same results synchronously and asynchronously", () =>
      assertForall(dataArb, dict(string), (xs, y) => {
        const f = ls.concatOne(y);
        return Promise.all([
          Promise.resolve(ds.fmapList("_lf_downloads", f, xs)),
          ds.fmapListAsync("_lf_downloads", f, xs),
        ]).spread(ds.equals);
      }));
  });
});

describe("new implementations", () => {
  it("of ds.equals with the same semantics", () =>
    assertForall(dataArb, dataArb, (xs, ys) =>
      isEqual(sort(ds.equals(xs, ys)), sort(legacyEquals(xs, ys)))
    ));
});

describe("data hashing", () => {
  it("hashes a single unit", () =>
    assertForall(unitArb, u => has("_lf_id_hash", ds.hashOne(u))));

  it("hashes many homonyms", () =>
    assertForall(dataArb, xs => {
      const hs = ds.hash(xs);
      return (
        every(has("_lf_id_hash"), hs) && every(has("_lf_content_hash"), hs)
      );
    }));
});
