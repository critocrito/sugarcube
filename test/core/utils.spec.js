import {concat, uniqWith, sortBy, isEqual} from "lodash/fp";

import jsc, {property} from "jsverify";

import {data, utils} from "../../packages/core";
import {dataArb} from "../../packages/test";

const {concatManyWith, equalsManyWith} = utils;

const {dataId, concatOne} = data;
const unique = uniqWith(isEqual);
const sort = sortBy(JSON.stringify);

describe("deep concatenation", () => {
  property("eliminates duplicates", dataArb, xs =>
    isEqual(
      sort(concatManyWith(dataId, isEqual, concatOne, xs, xs)),
      sort(unique(concat(xs, xs)))
    )
  );

  property("from left to right and right to left", dataArb, dataArb, (xs, ys) =>
    isEqual(
      sort(concatManyWith(dataId, isEqual, concatOne, xs, ys)),
      sort(concatManyWith(dataId, isEqual, concatOne, ys, xs))
    )
  );

  property("on equal data", dataArb, xs =>
    isEqual(
      sort(concatManyWith(dataId, isEqual, concatOne, xs, xs)),
      sort(unique(xs))
    )
  );
});

describe("equality testing", () => {
  property(
    "is equivalent to a fold over two lists",
    jsc.array(jsc.dict(jsc.string)),
    jsc.array(jsc.dict(jsc.string)),
    (xs, ys) => isEqual(isEqual(xs, ys), equalsManyWith(isEqual, xs, ys))
  );
});
