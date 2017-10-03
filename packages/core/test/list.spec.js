import {
  cloneDeep as clone,
  every,
  merge,
  identity,
  has,
  isEqual,
} from "lodash/fp";
import {assertForall, dict, string} from "jsverify";

import {listArb, listsArb} from "../lib/test/generators";
import list from "../lib/data/list";

const isTrue = isEqual(true);

describe("list interface", () => {
  it("holds for the reflecxivity of equality", () =>
    assertForall(listArb, h => isTrue(list.equalsOne(h, clone(h)))));

  it("holds for the symmetry of equality", () =>
    assertForall(listArb, h => {
      const j = clone(h);
      return isEqual(list.equalsOne(h, j), list.equalsOne(j, h));
    }));

  it("holds for the transitivity of equality", () =>
    assertForall(listArb, h => {
      const j = clone(h);
      const k = clone(h);
      return (
        list.equalsOne(h, j) && list.equalsOne(j, k) && list.equalsOne(h, k)
      );
    }));

  it("holds for the associativity of a monoid", () =>
    assertForall(listArb, listArb, listArb, (h, j, k) => {
      const lhs = list.concatOne(list.concatOne(h, j), k);
      const rhs = list.concatOne(h, list.concatOne(j, k));
      return list.equalsOne(lhs, rhs);
    }));

  it("holds for the right identity of a Monoid", () =>
    assertForall(listArb, h =>
      list.identicalOne(list.concatOne(h, list.emptyOne()), h)
    ));

  it("holds for the left identity of a Monoid", () =>
    assertForall(listArb, h =>
      list.equalsOne(list.concatOne(list.emptyOne(), h), h)
    ));
});

describe("lists interface", () => {
  it("holds for the reflexivity of equality", () =>
    assertForall(listsArb, xs => isTrue(list.equals(xs, clone(xs)))));

  it("holds for the symmetry of equality", () =>
    assertForall(listsArb, xs => {
      const ys = clone(xs);
      return isEqual(list.equals(xs, ys), list.equals(ys, xs));
    }));

  it("holds for the transitivity of equality", () =>
    assertForall(listsArb, xs => {
      const ys = clone(xs);
      const zs = clone(xs);
      return list.equals(xs, ys) && list.equals(ys, zs) && list.equals(xs, zs);
    }));

  it("holds for the associativity of a semigroup", () =>
    assertForall(listsArb, listsArb, listsArb, (xs, ys, zs) => {
      const lhs = list.concat(list.concat(xs, ys), zs);
      const rhs = list.concat(xs, list.concat(ys, zs));
      return list.equals(lhs, rhs);
    }));

  it("holds for the right identity of a Monoid", () =>
    assertForall(listsArb, xs =>
      list.equals(list.concat(xs, list.empty()), list.uniq(xs))
    ));

  it("holds for the left identity of a Monoid", () =>
    assertForall(listsArb, xs =>
      list.equals(list.concat(list.empty(), xs), list.uniq(xs))
    ));

  it("holds for the identity of a Functor", () =>
    assertForall(listsArb, xs => list.equals(list.fmap(identity, xs), xs)));

  it("holds for the composition of a Functor", () =>
    assertForall(listsArb, dict(string), dict(string), (xs, a, b) => {
      const f = merge(a);
      const g = merge(b);
      const lhs = list.fmap(z => f(g(z)), xs);
      const rhs = list.fmap(f, list.fmap(g, xs));
      return list.equals(lhs, rhs);
    }));
});

describe("lists hashing", () => {
  it("hashes a single list", () =>
    assertForall(listArb, h => has("_sc_id_hash", list.hashOne(h))));

  it("hashes many lists", () =>
    assertForall(listsArb, xs => every(has("_sc_id_hash"), list.hash(xs))));
});
