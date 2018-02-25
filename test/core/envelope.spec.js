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

import {envelope as env, data} from "../../packages/core/lib";
import {envelopeArb} from "../../packages/test/lib";

const {
  envelope,
  equals,
  empty,
  concat,
  union,
  intersection,
  difference,
  fmap,
  fmapAsync,
  fmapData,
  fmapDataAsync,
  fmapQueries,
  fmapQueriesAsync,
  fmapDataDownloads,
  fmapDataDownloadsAsync,
} = env;
const {dataId} = data;

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
    fmapAsync(x => Promise.resolve(x), x => Promise.resolve(x), a).then(
      equals(a)
    )
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

  describe("set operations", () => {
    property("produce unions", envelopeArb, envelopeArb, (a, b) =>
      equals(union(a, b), concat(a, b))
    );

    property("produce intersections", envelopeArb, envelopeArb, (a, b) => {
      const intersectionData = a.data.filter(u => {
        if (b.data.find(v => dataId(u) === dataId(v))) return true;
        return false;
      });
      const intersectionQueries = a.queries.filter(q => {
        if (b.queries.find(v => q.type === v.type && q.term === v.term))
          return true;
        return false;
      });
      return equals(
        intersection(a, b),
        envelope(intersectionData, intersectionQueries)
      );
    });

    property("produce left complements", envelopeArb, envelopeArb, (a, b) => {
      const complementData = a.data.filter(u => {
        if (b.data.find(v => dataId(u) === dataId(v))) return false;
        return true;
      });
      const complementQueries = a.queries.filter(q => {
        if (b.queries.find(v => q.type === v.type && q.term === v.term))
          return false;
        return true;
      });
      return equals(
        difference(a, b),
        envelope(complementData, complementQueries)
      );
    });

    property("union identity", envelopeArb, a => equals(union(a, empty()), a));

    property(
      "is associative for unions",
      envelopeArb,
      envelopeArb,
      envelopeArb,
      (a, b, c) => equals(union(union(a, b), c), union(a, union(b, c)))
    );

    property(
      "is associative for intersections",
      envelopeArb,
      envelopeArb,
      envelopeArb,
      (a, b, c) =>
        equals(
          intersection(intersection(a, b), c),
          intersection(a, intersection(b, c))
        )
    );

    property("is commutative for unions", envelopeArb, envelopeArb, (a, b) =>
      equals(union(a, b), union(b, a))
    );

    property(
      "is commutative for intersections",
      envelopeArb,
      envelopeArb,
      (a, b) => equals(intersection(a, b), intersection(b, a))
    );

    property(
      "first distributive law for unions and intersections",
      envelopeArb,
      envelopeArb,
      envelopeArb,
      (a, b, c) =>
        equals(
          union(a, intersection(b, c)),
          intersection(union(a, b), union(a, c))
        )
    );

    property(
      "second distributive law for unions and intersections",
      envelopeArb,
      envelopeArb,
      envelopeArb,
      (a, b, c) =>
        equals(
          intersection(a, union(b, c)),
          union(intersection(a, b), intersection(a, c))
        )
    );

    property(
      "disjoints on intersection are empty",
      envelopeArb,
      envelopeArb,
      (a, b) => {
        const x = difference(a, b);
        const y = difference(b, a);
        return equals(intersection(x, y), envelope([], []));
      }
    );

    property("intersection domination", envelopeArb, a =>
      equals(intersection(a, empty()), empty())
    );

    property("first absorption law", envelopeArb, envelopeArb, (a, b) =>
      equals(union(a, intersection(a, b)), a)
    );

    property("first absorption law", envelopeArb, envelopeArb, (a, b) =>
      equals(intersection(a, union(a, b)), a)
    );

    property(
      "express intersection in terms of set difference",
      envelopeArb,
      envelopeArb,
      (a, b) => equals(intersection(a, b), difference(a, difference(a, b)))
    );

    property(
      "first notable identity of complements",
      envelopeArb,
      envelopeArb,
      envelopeArb,
      (a, b, c) =>
        equals(
          difference(c, intersection(a, b)),
          union(difference(c, a), difference(c, b))
        )
    );

    property(
      "second notable identity of complements",
      envelopeArb,
      envelopeArb,
      envelopeArb,
      (a, b, c) =>
        equals(
          difference(c, union(a, b)),
          intersection(difference(c, a), difference(c, b))
        )
    );

    property(
      "third notable identity of complements",
      envelopeArb,
      envelopeArb,
      envelopeArb,
      (a, b, c) =>
        equals(
          difference(c, difference(b, a)),
          union(intersection(c, a), difference(c, b))
        )
    );

    property(
      "fourth notable identity of complements",
      envelopeArb,
      envelopeArb,
      envelopeArb,
      (a, b, c) => {
        const x = intersection(difference(b, a), c);
        const y = difference(intersection(b, c), a);
        const z = intersection(b, difference(c, a));

        return equals(x, y) && equals(x, z) && equals(y, z);
      }
    );

    property(
      "fifth notable identity of complements",
      envelopeArb,
      envelopeArb,
      envelopeArb,
      (a, b, c) =>
        equals(
          union(difference(b, a), c),
          difference(union(b, c), difference(a, c))
        )
    );

    property("sixth notable identity of complements", envelopeArb, a =>
      equals(difference(a, a), empty())
    );

    property("seventh notable identity of complements", envelopeArb, a =>
      equals(difference(empty(), a), empty())
    );

    property("eigth notable identity of complements", envelopeArb, a =>
      equals(difference(a, empty()), a)
    );
  });

  // I construct objects from symbols to avoid equality issues that arise from
  // unicode in isMatch.
  describe("fmap and fmapAsync", () => {
    property("maps a function over a list of units", envelopeArb, a => {
      const obj = {[Symbol("key")]: Symbol("value")};
      const f = y => merge(y, obj);
      const b = fmap(f, f, a);
      return every(isMatch(obj), loConcat(b.data, b.queries));
    });

    property(
      "overloaded fmapAsync to allow two type signatures",
      envelopeArb,
      async a => {
        const obj = {[Symbol("key")]: Symbol("value")};
        const f = y => merge(y, obj);
        const p = flow([f, of]);
        return equals(await fmapAsync(f, f, a), await fmapAsync(p, p, a));
      }
    );

    property(
      "produces the same results synchronously and asynchronously",
      envelopeArb,
      async a => {
        const obj = {[Symbol("key")]: Symbol("value")};
        const f = y => merge(y, obj);
        return equals(fmap(f, f, a), await fmapAsync(f, f, a));
      }
    );

    property("has a specialized version for data", envelopeArb, async a => {
      const obj = {[Symbol("key")]: Symbol("value")};
      const f = y => merge(y, obj);
      const b = fmap(f, identity, a);

      return every(equals(b), [fmapData(f, a), await fmapDataAsync(f, a)]);
    });

    property("has a specialized version for queries", envelopeArb, async a => {
      const obj = {[Symbol("key")]: Symbol("value")};
      const f = y => merge(y, obj);
      const b = fmap(identity, f, a);
      return every(equals(b), [
        fmapQueries(f, a),
        await fmapQueriesAsync(f, a),
      ]);
    });

    property(
      "works with synchronous and asynchronous mappers",
      jsc.bool,
      jsc.bool,
      envelopeArb,
      async (isF, isG, e) => {
        const f = isF ? a => a : a => Promise.resolve(a);
        const g = isG ? a => a : a => Promise.resolve(a);

        const results = await fmap(f, g, e);

        return equals(results, e);
      }
    );
  });

  describe("fmapDataList and fmapDataListAsync", () => {
    property("can map over sub lists of units of data", envelopeArb, a => {
      const obj = {[Symbol("key")]: Symbol("value")};
      const f = flow([
        fmapDataDownloads(y => merge(y, obj)),
        loProperty("data"),
        flatMap(loProperty("_sc_downloads")),
        every(isMatch(obj)),
      ]);

      return f(a);
    });

    property(
      "produces the same results synchronously and asynchronously",
      envelopeArb,
      async a => {
        const obj = {[Symbol("key")]: Symbol("value")};
        const f = y => merge(y, obj);
        return equals(
          fmapDataDownloads(f, a),
          await fmapDataDownloadsAsync(f, a)
        );
      }
    );
  });
});
