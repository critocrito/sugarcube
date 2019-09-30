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

  it("chains updates in sequence", () => {
    const s = state({a: 0, b: []});
    s.get().should.eql({a: 0, b: []});
    s.update(({a, b}) => ({a: a + 1, b: b.concat(a)}));
    s.get().should.eql({a: 1, b: [0]});
    s.update(({a, b}) => ({a: a + 1, b: b.concat(a)}));
    s.get().should.eql({a: 2, b: [0, 1]});
  });

  it("can sequence a lot of updates", () => {
    const iterations = 100000;
    const f = ({count}) => ({count: count + 1});
    const s = state({count: 0});

    [...Array(iterations).keys()].forEach(() => s.update(f));

    s.get().should.eql({count: iterations});
  });

  it("accepts null and undefined as constructor", () => {
    let s = state(undefined);
    s.get().should.eql({});
    s = state(null);
    s.get().should.eql({});
  });

  it("accepts a state object as constructor", () => {
    const s1 = state();
    s1.update(() => ({a: 23}));

    const s = state(s1);

    s.get().should.eql(s1.get());
  });

  it("accepts a plain object as constructor", () => {
    const obj = {a: 23};

    const s = state(obj);

    s.get().should.eql(obj);
  });
});
