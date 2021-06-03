import crypto from "crypto";
import {sortBy, isEqual} from "lodash/fp";

import jsc, {property} from "jsverify";
import sinon from "sinon";

import data from "../../packages/core/lib/data/data";
import {
  concatManyWith,
  equalsManyWith,
  isThenable,
  aToS,
  sToA,
} from "../../packages/core/lib/utils";
import {dataArb} from "../../packages/test/lib";
import {uid} from "../../packages/core/lib/crypto";

const {dataId, concatOne} = data;
const sort = sortBy(JSON.stringify);

const maybePromiseArb = jsc
  .tuple([jsc.nat, jsc.bool])
  .smap(
    ([x, toPromisify]) => [toPromisify ? Promise.resolve(x) : x, toPromisify],
    jsc.shrink.tuple([jsc.nat.shrink, jsc.shrink.noop]),
  );

describe("deep concatenation", () => {
  property("from left to right and right to left", dataArb, dataArb, (xs, ys) =>
    isEqual(
      sort(concatManyWith(dataId, concatOne, xs, ys)),
      sort(concatManyWith(dataId, concatOne, ys, xs)),
    ),
  );

  // FIXME: This test fails, because concatManyWith doesn't generate
  // _sc_id_hash for all semantic sub lists in the unit. Prehashing every unit
  // fixes the test. Needs revision.
  property("on equal data", dataArb, (xs) =>
    isEqual(
      sort(concatManyWith(dataId, concatOne, data.hash(xs), data.hash(xs))),
      sort(concatManyWith(dataId, concatOne, data.hash(xs), [])),
    ),
  );
});

describe("equality testing", () => {
  property(
    "is equivalent to a fold over two lists",
    jsc.array(jsc.dict(jsc.string)),
    jsc.array(jsc.dict(jsc.string)),
    (xs, ys) => isEqual(isEqual(xs, ys), equalsManyWith(isEqual, xs, ys)),
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
    const random = crypto.createHash("sha1").update(seed).digest("hex");
    return crypto.createHmac("sha1", random).update(counter).digest("hex");
  };

  property("pure version", jsc.nestring, (seed) => {
    const d = Date.now();
    return isEqual(id(seed, d), uid(seed, d));
  });

  property("uses now as counter if not specified", jsc.nestring, (seed) => {
    const d = Date.now();
    return isEqual(id(seed, d), uid(seed));
  });

  property("produces strings of 40 characters", jsc.unit, () =>
    isEqual(40, uid().length),
  );
});

describe("The isThenable util", () => {
  property(
    "tests if an object is a promise",
    maybePromiseArb,
    ([obj, gotPromisified]) => isEqual(isThenable(obj), gotPromisified),
  );
});

describe("value transformations", () => {
  it("converts arrays into strings", () => {
    const value = ["one", "two"];
    const expected = "one,two";
    aToS(",", value).should.eql(expected);
  });

  it("trims strings during conversion", () => {
    const value = ["one ", " two"];
    const expected = "one,two";
    aToS(",", value).should.eql(expected);
  });

  it("converts arrays into strings only if it is an array", () => {
    const value = "one,two";
    const expected = "one,two";
    aToS(",", value).should.eql(expected);
  });

  it("when converting to array and it is a string, trim it's elements", () => {
    const value = "one, two ";
    const expected = "one,two";
    aToS(",", value).should.eql(expected);
  });

  it("converts an empty array to an empty string", () => {
    const value = [];
    const expected = "";
    aToS(",", value).should.eql(expected);
  });

  it("converts nil to an empty string", () => {
    const value = null;
    const expected = "";
    aToS(",", value).should.eql(expected);
  });

  it("converts strings into arrays", () => {
    const value = "one,two";
    const expected = ["one", "two"];
    sToA(",", value).should.eql(expected);
  });

  it("trims values during conversion", () => {
    const value = " one, two , three";
    const expected = ["one", "two", "three"];
    sToA(",", value).should.eql(expected);
  });

  it("only converts strings to arrays if it's a string", () => {
    const value = ["one", "two"];
    const expected = ["one", "two"];
    sToA(",", value).should.eql(expected);
  });

  it("converts an empty string to an empty array", () => {
    const value = "";
    const expected = [];
    sToA(",", value).should.eql(expected);
  });

  it("converts nil to an empty array", () => {
    const value = null;
    const expected = [];
    sToA(",", value).should.eql(expected);
  });

  it("can handle different delimiters when converting strings to arrays", () => {
    const value = "one|two";
    const expected = ["one", "two"];
    [sToA("|", value), sToA(",", value.replace(/\|/g, ","))].should.eql([
      expected,
      expected,
    ]);
  });

  property("conversion is idempotent", "asciichar & string", ([d, s]) => {
    const delimiter = d.replace(/\s/, ",");
    const value = s.replace(/\s/g, "");
    return isEqual(aToS(delimiter, sToA(delimiter, value)), value);
  });
});
