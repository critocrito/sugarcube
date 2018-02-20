import {
  flow,
  identity,
  replace,
  merge,
  set,
  split,
  join,
  isEqual,
} from "lodash/fp";
import jsc, {property} from "jsverify";

import {state} from "../../packages/core/lib/state";

const isJsonEqual = (a, b) =>
  isEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

const pathArb = jsc.suchthat(
  jsc.asciinestring.smap(
    flow([replace(/\s*\.*/g, ""), split(""), join(".")]),
    identity
  ),
  x => x !== ""
);

const stateArb = jsc.bless({
  generator: seed => {
    const keyArb = jsc.bless({
      generator: () =>
        Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, "")
          .substr(0, 5),
    });
    const valueArb = jsc.oneof([jsc.bool, jsc.number, jsc.string]);

    return jsc
      .array(keyArb)
      .generator(seed)
      .reduce(
        (memo, key) => merge(memo, {[key]: valueArb.generator(seed)}),
        {}
      );
  },
});

describe("state", () => {
  property("creation", stateArb, data => {
    const s = state(data);
    return isJsonEqual(s.get(), data);
  });

  property("update", stateArb, stateArb, (obj, data) => {
    const s = state(obj);
    s.update(x => merge(x, data));
    return isJsonEqual(s.get(), merge(obj, data));
  });

  property(
    "update with path",
    pathArb,
    stateArb,
    stateArb,
    (path, obj, data) => {
      const s = state(obj);
      s.update(path, x => merge(x, data));
      const updated = path ? set(path, data, {}) : data;

      return isJsonEqual(s.get(), merge(obj, updated));
    }
  );

  property("get with path", pathArb, stateArb, (path, data) => {
    const obj = path ? set(path, data, {}) : {};
    const s = state(obj);

    return isJsonEqual(s.get(path), path ? data : {});
  });

  property("updates an existing path", pathArb, stateArb, (path, data) => {
    const obj = path ? set(path, {}, {}) : {};
    const s = state(obj);
    s.update(path, x => merge(x, data));

    return isJsonEqual(s.get(path), path ? data : {});
  });
});
