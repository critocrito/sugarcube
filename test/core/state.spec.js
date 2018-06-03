import {
  flow,
  replace,
  merge,
  get,
  split,
  join,
  isEqual,
  isPlainObject,
} from "lodash/fp";
import jsc, {property} from "jsverify";

import {state} from "../../packages/core/lib/state";
import {objArb} from "../../packages/test/lib/generators";

const pathArb = jsc.suchthat(
  jsc.asciinestring.smap(
    flow([replace(/\s*\.*/g, ""), split(""), join(".")]),
    jsc.asciinestring.shrink,
  ),
  s => s !== "",
);

const stateArb = objArb.smap(o => state(o), s => objArb.shrink(s.get()));

describe("state", () => {
  property("get === get", stateArb, s => isEqual(s.get(), s.get()));

  property("always return an object for a path", stateArb, pathArb, (s, path) =>
    isPlainObject(s.get(path)),
  );

  property("updates are sequences", stateArb, jsc.array(objArb), (s, xs) => {
    const obj = xs.reduce(merge, s.get());
    xs.forEach(x => s.update(y => merge(y, x)));
    return isEqual(obj, s.get());
  });

  property("update with paths", stateArb, pathArb, objArb, (s, p, o) => {
    s.update(p, x => merge(x, o));
    return isEqual(get(p, s.get()), s.get(p));
  });

  property(
    "update with paths multiple times",
    stateArb,
    pathArb,
    objArb,
    objArb,
    (s, p, o1, o2) => {
      s.update(p, x => merge(x, o1));
      s.update(p, x => merge(x, o2));
      return isEqual(get(p, s.get()), s.get(p));
    },
  );
});
