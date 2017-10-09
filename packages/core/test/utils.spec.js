import {take, concat, uniqWith, sortBy, isEqual} from "lodash/fp";

import {assertForall, array, dict, string} from "jsverify";

import {utils} from "../lib";
import d from "../lib/data/data";

import {dataArb} from "../lib/test/generators";

const {concatManyWith, equalsManyWith} = utils;

const {dataId, concatOne} = d;
const unique = uniqWith(isEqual);
const sort = sortBy(JSON.stringify);

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
