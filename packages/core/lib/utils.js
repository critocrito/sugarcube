import {
  flow,
  map,
  concat,
  merge,
  cloneDeep,
  partialRight,
  keyBy,
  keys,
  intersection,
  xor,
  isEqualWith,
  isString,
  isArray,
} from "lodash/fp";
import {inspect} from "util";

const ncurry = n => {
  const localCurry = (name, f, ...args) => {
    const g = (...largs) => {
      const rest = args.concat(largs);

      if (rest.length < n) return localCurry(name, f, ...rest);
      return f(...rest);
    };
    const desc = `${name}-${n - args.length}`;
    Object.defineProperty(g, "name", {value: desc, configureable: true});
    return g;
  };

  Object.defineProperty(localCurry, "name", {
    value: `curry${n}`,
    configureable: true,
  });
  return localCurry;
};

export const curry2 = ncurry(2);
export const curry3 = ncurry(3);
export const curry4 = ncurry(4);
export const curry5 = ncurry(5);

export const now = () => new Date();

export const tap = curry2("tap", (f, x) => {
  f(cloneDeep(x));
  return x;
});

export const printf = (x, opts = {}) => {
  const options = merge({colors: true}, opts);
  const f = flow([
    partialRight(inspect, [options]),
    console.log, // eslint-disable-line no-console
  ]);
  return tap(f, x);
};

export const stringify = s => (isString(s) ? s : JSON.stringify(s));
export const arrayify = a => (isArray(a) ? a : [a]);

export const concatManyWith = curry5(
  "concatManyWith",
  (idField, identical, merger, xs, ys) => {
    const x = keyBy(idField, xs);
    const y = keyBy(idField, ys);
    const kx = keys(x);
    const ky = keys(y);

    const same = intersection(kx, ky);
    const different = xor(kx, ky);

    const merged = map(
      id => (identical(x[id], y[id]) ? x[id] : merger(x[id], y[id])),
      same
    );

    const notmerged = map(id => x[id] || y[id], different);
    return concat(merged, notmerged);
  }
);

export const equalsManyWith = curry3("equalsManyWith", (cmp, xs, ys) => {
  if (xs.length !== ys.length) return false;
  if (xs.length === 0) return true;
  return isEqualWith(cmp, xs, ys);
});

export const isFunction = f => typeof f === "function";

export const isThenable = p =>
  p instanceof Promise ||
  (Boolean(p) &&
    (typeof p === "object" || typeof p === "function") &&
    isFunction(p.then));

export default {
  curry2,
  curry3,
  curry4,
  curry5,
  now,
  tap,
  printf,
  stringify,
  arrayify,
  concatManyWith,
  equalsManyWith,
  isFunction,
  isThenable,
};
