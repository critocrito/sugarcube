import {
  curry,
  flow,
  map,
  concat,
  merge,
  pickBy,
  cloneDeep,
  partialRight,
  keyBy,
  keys,
  intersection,
  xor,
  has,
  isEqualWith,
  isString,
  isArray,
} from "lodash/fp";
import {inspect} from "util";

export const now = () => new Date();

export const tap = curry((f, x) => {
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

export const concatManyWith = curry((idField, identical, merger, xs, ys) => {
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
});

export const equalsManyWith = curry((cmp, xs, ys) => {
  if (xs.length !== ys.length) return false;
  if (xs.length === 0) return true;
  return isEqualWith(cmp, xs, ys);
});

/**
 * Return all available options for the given plugins.
 *
 * @returns {Object} options The available options.
 */
export const pluginOptions = pickBy(has("argv"));

// TODO: Deprecated.
export const deepConcatWith = concatManyWith;

export default {
  now,
  tap,
  printf,
  stringify,
  arrayify,
  concatManyWith,
  equalsManyWith,
  pluginOptions,
  // TODO: Deprecated.
  deepConcatWith,
};
