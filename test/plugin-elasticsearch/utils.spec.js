import {reduce, isEqual, isPlainObject, isArray} from "lodash/fp";
import {property} from "jsverify";

import {unitArb} from "../../packages/test";
import {
  stripUnderscores,
  unstripify,
} from "../../packages/plugin-elasticsearch/lib/utils";

const isValidKeys = (test, obj) => {
  const isValidArrayOfKeys = reduce((memo, v) => {
    if (memo === false) return memo;
    if (isPlainObject(v)) return isValidKeys(test, v);
    if (isArray(v)) return isValidArrayOfKeys(v);
    return memo;
  }, true);

  return Object.keys(obj).reduce((memo, key) => {
    if (memo === false) return memo;
    if (isPlainObject(obj[key]))
      return test(key) && isValidKeys(test, obj[key]);
    if (isArray(obj[key])) return test(key) && isValidArrayOfKeys(obj[key]);
    return test(key);
  }, true);
};

describe("unit keys", () => {
  property("strip _", unitArb, unit => {
    const test = key => /^[^_]+/.test(key);
    return isValidKeys(test, stripUnderscores(unit));
  });

  property("prepend internal fields with a -", unitArb, unit => {
    const test = key => (key.slice(1, 4) === "sc_" ? /^\$sc_/.test(key) : true);
    return isValidKeys(test, stripUnderscores(unit));
  });

  property("stripping underscores can be inversed", unitArb, unit =>
    isEqual(unstripify(stripUnderscores(unit)), unit),
  );

  it("it recursively strips", () => {
    const obj = {_a: [{_a: 23}]};
    const expected = {$a: [{$a: 23}]};
    const result = stripUnderscores(obj);
    result.should.eql(expected);
  });

  it("it recursively unstrips", () => {
    const obj = {$a: [{$a: 23}]};
    const expected = {_a: [{_a: 23}]};
    const result = unstripify(obj);
    result.should.eql(expected);
  });
});
