import {
  flow,
  flatMap,
  every,
  identity,
  cloneDeep as clone,
  merge,
  property as loProperty,
  concat as loConcat,
  isMatch,
  isEqual,
} from "lodash/fp";
import {of} from "dashp";
import jsc, {property} from "jsverify";

import {envelope} from "../../packages/core";
import {envelopeArb} from "../../packages/test";

const {
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
} = envelope;

const isTrue = isEqual(true);

describe("envelope interface", () => {
  property("reflexivity of identity equality", envelopeArb, a =>
    isTrue(equals(a, clone(a)))
  );

  property(
    "symmetry of identical equality",
    envelopeArb,
    a => equals(a, clone(a)) && equals(clone(a), a)
  );

  property("transitivity of identity equality", envelopeArb, a => {
    const b = clone(a);
    const c = clone(a);
    return equals(a, b) && equals(b, c) && equals(a, c);
  });

  property(
    "assocativity of a Monoid",
    envelopeArb,
    envelopeArb,
    envelopeArb,
    (a, b, c) => {
      const lhs = concat(concat(a, b), c);
      const rhs = concat(a, concat(b, c));
      return equals(lhs, rhs);
    }
  );

  property("right identity of a Monoid", envelopeArb, a =>
    equals(concat(a, empty()), a)
  );

  property("left identity of a Monoid", envelopeArb, a =>
    equals(a, concat(a, empty()))
  );

  property("identity of a Functor", envelopeArb, a =>
    equals(fmap(identity, identity, a), a)
  );

  property("identity of a Functor asynchronously", envelopeArb, a =>
    fmapAsync(identity, identity, a).then(equals(a))
  );

  property(
    "composition of a Functor",
    envelopeArb,
    jsc.dict(jsc.string),
    jsc.dict(jsc.string),
    (a, x, y) => {
      const f = merge(x);
      const g = merge(y);
      return equals(
        fmap(z => f(g(z)), z => f(g(z)), a),
        fmap(f, f, fmap(g, g, a))
      );
    }
  );

  property(
    "composition of a Functor asynchronously",
    envelopeArb,
    jsc.dict(jsc.string),
    jsc.dict(jsc.string),
    async (a, x, y) => {
      const f = merge(x);
      const g = merge(y);
      return equals(
        await fmapAsync(z => f(g(z)), z => f(g(z)), a),
        await fmapAsync(f, f, fmap(g, g, a))
      );
    }
  );

  describe("fmap and fmapAsync", () => {
    property(
      "maps a function over a list of units",
      envelopeArb,
      jsc.dict(jsc.string),
      (a, x) => {
        const f = merge(x);
        const b = fmap(f, f, a);
        return every(isMatch(x), loConcat(b.data, b.queries));
      }
    );

    property(
      "overloaded fmapAsync to allow two type signatures",
      envelopeArb,
      jsc.dict(jsc.string),
      async (a, x) => {
        const f = merge(x);
        const p = flow([f, of]);
        return equals(await fmapAsync(f, f, a), await fmapAsync(p, p, a));
      }
    );

    property(
      "produces the same results synchronously and asynchronously",
      envelopeArb,
      jsc.dict(jsc.string),
      async (a, x) => {
        const f = merge(x);
        return equals(await of(fmap(f, f, a)), await fmapAsync(f, f, a));
      }
    );

    property(
      "has a specialized version for data",
      envelopeArb,
      jsc.dict(jsc.string),
      async (a, x) => {
        const f = merge(x);
        const b = fmap(f, identity, a);

        return every(equals(b), [
          await of(fmapData(f, a)),
          await fmapDataAsync(f, a),
        ]);
      }
    );

    property(
      "has a specialized version for queries",
      envelopeArb,
      jsc.dict(jsc.string),
      async (a, x) => {
        const f = merge(x);
        const b = fmap(identity, f, a);
        return every(equals(b), [
          await of(fmapQueries(f, a)),
          await fmapQueriesAsync(f, a),
        ]);
      }
    );
  });

  describe("fmapDataList and fmapDataListAsync", () => {
    property(
      "can map over sub lists of units of data",
      envelopeArb,
      jsc.dict(jsc.string),
      (a, x) =>
        flow([
          fmapDataDownloads(merge(x)),
          loProperty("data"),
          flatMap(loProperty("_sc_downloads")),
          every(isMatch(x)),
        ])(a)
    );

    property(
      "produces the same results synchronously and asynchronously",
      envelopeArb,
      jsc.dict(jsc.string),
      async (a, x) => {
        const f = merge(x);
        return equals(
          await of(fmapDataDownloads(f, a)),
          await fmapDataDownloadsAsync(f, a)
        );
      }
    );
  });
});
