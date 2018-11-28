import {
  flow,
  merge,
  cloneDeep,
  partialRight,
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
    g.missing = n - args.length;
    const desc = `${name}-${g.missing}`;
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
export const curry6 = ncurry(6);
export const curry7 = ncurry(7);
export const curry8 = ncurry(8);

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

export const concatManyWith = (idField, merger, xs, ys) => {
  if (xs.length === 0) return ys;
  if (ys.length === 0) return xs;

  const obj = new Map();

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < xs.length; i++) {
    const unit = xs[i];
    const id = idField(unit);
    if (obj.has(id)) {
      obj.set(id, merger(obj.get(id), unit));
    } else {
      obj.set(id, Object.assign({_sc_id_hash: id}, unit));
    }
  }
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < ys.length; i++) {
    const unit = ys[i];
    const id = idField(unit);
    if (obj.has(id)) {
      obj.set(id, merger(obj.get(id), unit));
    } else {
      obj.set(id, Object.assign({_sc_id_hash: id}, unit));
    }
  }
  return Array.from(obj.values());
};

export const equalsManyWith = (cmp, xs, ys) => {
  if (xs.length !== ys.length) return false;
  if (xs.length === 0) return true;
  return isEqualWith(cmp, xs, ys);
};

export const isFunction = f => typeof f === "function";

export const isThenable = p =>
  p instanceof Promise ||
  (Boolean(p) &&
    (typeof p === "object" || typeof p === "function") &&
    isFunction(p.then));

export const sToA = curry2("sToA", (delimiter, val) => {
  if (!val || val.length === 0) return [];
  if (Array.isArray(val)) return val;
  return val.split(delimiter).map(s => s.trim());
});

export const aToS = curry2("aToS", (delimiter, val) => {
  let v = val;
  if (!val || typeof val === "string") v = sToA(delimiter, val);
  return v.map(s => s.trim()).join(delimiter);
});

export default {
  curry2,
  curry3,
  curry4,
  curry5,
  curry6,
  curry7,
  curry8,
  now,
  tap,
  printf,
  stringify,
  arrayify,
  concatManyWith,
  equalsManyWith,
  isFunction,
  isThenable,
  aToS,
  sToA,
};
