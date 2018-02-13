import crypto from "crypto";
import {concat, uniqWith, sortBy, isEqual} from "lodash/fp";

import jsc, {property} from "jsverify";
import sinon from "sinon";

import data from "../../packages/core/lib/data/data";
import {concatManyWith, equalsManyWith} from "../../packages/core/lib/utils";
import {dataArb} from "../../packages/test";
import {uid} from "../../packages/core/lib/crypto";

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

describe("uid generation", () => {
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers(Date.now());
  });

  afterEach(() => {
    clock.restore();
  });

  const id = (seed, d) => {
    const counter = crypto
      .createHash("sha1")
      .update(Math.floor(d / 1000).toString())
      .digest("hex");
    const random = crypto
      .createHash("sha1")
      .update(seed)
      .digest("hex");
    return crypto
      .createHmac("sha1", random)
      .update(counter)
      .digest("hex");
  };

  property("pure version", jsc.nestring, seed => {
    const d = Date.now();
    return isEqual(id(seed, d), uid(seed, d));
  });

  property("uses now as counter if not specified", jsc.nestring, seed => {
    const d = Date.now();
    return isEqual(id(seed, d), uid(seed));
  });

  property("produces strings of 40 characters", jsc.unit, () =>
    isEqual(40, uid().length)
  );
});
