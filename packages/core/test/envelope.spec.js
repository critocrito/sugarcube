import {
  flow,
  flatMap,
  every,
  identity,
  cloneDeep as clone,
  merge,
  property,
  concat as loConcat,
  isMatch,
  isEqual,
} from "lodash/fp";
import Promise from "bluebird";
import {assertForall, dict, string} from "jsverify";

import {
  equals,
  empty,
  concat,
  fmap,
  fmapAsync,
  fmapData,
  fmapDataAsync,
  fmapQueries,
  fmapQueriesAsync,
  fmapDataDownloads,
  fmapDataDownloadsAsync,
} from "../lib/data/envelope";
import {envelopeArb} from "../lib/test/generators";

const isTrue = isEqual(true);

describe("envelope interface", () => {
  it("holds for the reflexivity of identity equality", () =>
    assertForall(envelopeArb, a => isTrue(equals(a, clone(a)))));

  it("holds for the symmetry of identical equality", () =>
    assertForall(envelopeArb, a => {
      const b = clone(a);
      return equals(a, b) && equals(b, a);
    }));

  it("holds for the transitivity of identity equality", () =>
    assertForall(envelopeArb, a => {
      const b = clone(a);
      const c = clone(a);
      return equals(a, b) && equals(b, c) && equals(a, c);
    }));

  it("holds for the assocativity of a Monoid", () =>
    assertForall(envelopeArb, envelopeArb, envelopeArb, (a, b, c) => {
      const lhs = concat(concat(a, b), c);
      const rhs = concat(a, concat(b, c));
      return equals(lhs, rhs);
    }));

  it("holds for the right identity of a Monoid", () =>
    assertForall(envelopeArb, a => equals(concat(a, empty()), a)));

  it("holds for the left identity of a Monoid", () =>
    assertForall(envelopeArb, a => equals(a, concat(a, empty()))));

  it("holds for the identity of a Functor", () =>
    assertForall(envelopeArb, a => equals(fmap(identity, identity, a), a)));

  it("holds for the identity of a Functor asynchronously", () =>
    assertForall(envelopeArb, a =>
      fmapAsync(identity, identity, a).then(equals(a))
    ));

  it("holds for the composition of a Functor", () =>
    assertForall(envelopeArb, dict(string), dict(string), (a, x, y) => {
      const f = merge(x);
      const g = merge(y);
      const lhs = fmap(z => f(g(z)), z => f(g(z)), a);
      const rhs = fmap(f, f, fmap(g, g, a));
      return equals(lhs, rhs);
    }));

  it("holds for the composition of a Functor asynchronously", () =>
    assertForall(envelopeArb, dict(string), dict(string), (a, x, y) => {
      const f = merge(x);
      const g = merge(y);
      const lhs = fmapAsync(z => f(g(z)), z => f(g(z)), a);
      const rhs = fmapAsync(f, f, fmap(g, g, a));
      return Promise.all([lhs, rhs]).spread(equals);
    }));

  describe("fmap and fmapAsync", () => {
    it("maps a function over a list of units", () =>
      assertForall(envelopeArb, dict(string), (a, x) => {
        const f = merge(x);
        const b = fmap(f, f, a);
        return every(isMatch(x), loConcat(b.data, b.queries));
      }));

    it("overloaded fmapAsync to allow two type signatures", () =>
      assertForall(envelopeArb, dict(string), (a, x) => {
        const f = merge(x);
        const p = flow([f, Promise.resolve]);
        return Promise.all([fmapAsync(f, f, a), fmapAsync(p, p, a)]).spread(
          equals
        );
      }));

    it("produces the same results synchronously and asynchronously", () =>
      assertForall(envelopeArb, dict(string), (a, x) => {
        const f = merge(x);
        return Promise.all([
          Promise.resolve(fmap(f, f, a)),
          fmapAsync(f, f, a),
        ]).spread(equals);
      }));

    it("has a specialized version for data", () =>
      assertForall(envelopeArb, dict(string), (a, x) => {
        const f = merge(x);
        const b = fmap(f, identity, a);

        return Promise.all([
          Promise.resolve(fmapData(f, a)),
          fmapDataAsync(f, a),
        ]).then(every(equals(b)));
      }));

    it("has a specialized version for queries", () =>
      assertForall(envelopeArb, dict(string), (a, x) => {
        const f = merge(x);
        const b = fmap(identity, f, a);

        return Promise.all([
          Promise.resolve(fmapQueries(f, a)),
          fmapQueriesAsync(f, a),
        ]).then(every(equals(b)));
      }));
  });

  describe("fmapDataList and fmapDataListAsync", () => {
    it("can map over sub lists of units of data", () =>
      assertForall(envelopeArb, dict(string), (a, x) => {
        const f = merge(x);
        const b = fmapDataDownloads(f, a);
        return flow([flatMap(property("_lf_downloads")), every(isMatch(x))])(
          b.data
        );
      }));

    it("produces the same results synchronously and asynchronously", () =>
      assertForall(envelopeArb, dict(string), (a, x) => {
        const f = merge(x);
        return Promise.all([
          Promise.resolve(fmapDataDownloads(f, a)),
          fmapDataDownloadsAsync(f, a),
        ]).spread(equals);
      }));
  });
});
