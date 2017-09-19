import {
  take,
  sum,
  concat,
  uniqWith,
  sortBy,
  size,
  every,
  isEqual,
} from "lodash/fp";
import Promise from "bluebird";
import {assertForall, array, dict, fun, nat, string} from "jsverify";

import {asyncFn} from "./arbitraries";
import {utils} from "../lib";
import d from "../lib/data/data";

import {dataArb} from "../lib/test/generators";

const {concatManyWith, equalsManyWith} = utils;
const {composeP, flowP, mapP, reduceP, promisify} = utils.combinators;

const {dataId, concatOne} = d;
const unique = uniqWith(isEqual);
const sort = sortBy(JSON.stringify);

describe("Promise combinators", () => {
  it("can promisify ordinary functions", () =>
    assertForall(fun(nat), f => typeof promisify(f)(0).then === "function"));

  it("compose", () =>
    assertForall(asyncFn, asyncFn, (f, g) =>
      Promise.all([composeP(f, g, 0), composeP(f, g, Promise.resolve(0))]).then(
        every(isEqual(2))
      )
    ));

  it("can compose functions returning a promise", () =>
    assertForall(array(asyncFn), fs =>
      flowP(fs)(0).then(r => isEqual(r, size(fs)))
    ));

  it("can map a list of values or promises", () =>
    assertForall(array(asyncFn), fs =>
      mapP(f => f(0), fs).then(
        rs => isEqual(size(rs), size(fs)) && isEqual(sum(rs), size(fs))
      )
    ));

  it("can reduce a list of values or promises", () =>
    assertForall(array(asyncFn), fs =>
      reduceP((memo, f) => f(memo), 0, fs).then(isEqual(size(fs)))
    ));
});

describe("deep concatenation", () => {
  it("eliminates duplicates to the right", () =>
    assertForall(dataArb, xs => {
      const ys = take(1, xs);
      const lhs = concatManyWith(dataId, isEqual, concatOne, xs, ys);
      const rhs = unique(concat(xs, ys));
      return isEqual(sort(lhs), sort(rhs));
    }));

  it("eliminates duplicates to the left", () =>
    assertForall(dataArb, xs => {
      const ys = take(1, xs);
      const lhs = concatManyWith(dataId, isEqual, concatOne, ys, xs);
      const rhs = unique(concat(ys, xs));
      return isEqual(sort(lhs), sort(rhs));
    }));

  it("from left to right and right to left", () =>
    assertForall(dataArb, dataArb, (xs, ys) => {
      const lhs = concatManyWith(dataId, isEqual, concatOne, xs, ys);
      const rhs = concatManyWith(dataId, isEqual, concatOne, ys, xs);
      return isEqual(sort(lhs), sort(rhs));
    }));

  it("on equal data", () =>
    assertForall(dataArb, xs =>
      isEqual(
        sort(concatManyWith(dataId, isEqual, concatOne, xs, xs)),
        sort(unique(xs))
      )
    ));

  it("treats duplicates correctly", () =>
    assertForall(dataArb, xs => {
      const ys = concat(xs, xs);
      return isEqual(
        sort(concatManyWith(dataId, isEqual, concatOne, ys, ys)),
        sort(unique(xs))
      );
    }));
});

describe("equality testing", () => {
  it("is equivalent to a fold over two lists", () =>
    assertForall(array(dict(string)), array(dict(string)), (xs, ys) => {
      const lhs = isEqual(xs, ys);
      const rhs = equalsManyWith(isEqual, xs, ys);
      return isEqual(sort(lhs), sort(rhs));
    }));
});
