import {flow, curry, reduce, merge, flatten, cloneDeep} from "lodash/fp";
import Promise from "bluebird";

// composeP :: (b -> Future c) -> (a -> Future b) -> Future a -> Future c
// composeP :: (b -> Future c) -> (a -> Future b) -> a -> Future c
// This function is overloaded to allow async and non async input.
export const composeP = curry((f, g, a) =>
  Promise.resolve(a)
    .then(g)
    .then(f)
);

export const flowP = curry((fs, x) =>
  reduce((memo, f) => memo.then(f), Promise.resolve(x), fs)
);

export const allP = Promise.all;

export const joinP = curry((f, p) => Promise.join(p, f));
export const joinP2 = curry((f, p1, p2) => Promise.join(p1, p2, f));

export const mapP = curry((f, xs) => Promise.map(xs, f, {concurrency: 1}));
export const mapP2 = curry((f, xs) => Promise.map(xs, f, {concurrency: 2}));

export const flatMapP = curry((f, xs) => mapP(f, xs).then(flatten));

/**
 * Reduce a list of values over an applicative.
 *
 * ```
 * reduceP :: Applicative f => (Future b -> a -> Future b) -> f (Future b)
 *                             -> [a] -> f (Future b)
 * reduceP :: Applicative f => (b -> a -> f b) -> b -> [a] -> f b
 * ```
 * @param {Function.<Promise, any>} f The reduce function, takes a promise as
 * accumulator and a value.
 * @param {Promise} acc The initial accumulator value.
 * @param {Array.<any>} xs A list of values to reduce.
 * @example
 * reduceP((memo, a) => memo.then(r => r + a), 0, [1,2,3]);
 */
export const reduceP = curry((f, acc, xs) => Promise.reduce(xs, f, acc));

export const promisify = f => flow([f, Promise.resolve]);

export const tapP = curry((f, xs) => flowP([cloneDeep, f, () => xs])(xs));

export const retry = (action, cfg = {}) => {
  const opts = merge({times: 5, delay: 250, delayModifier: 1.5}, cfg);

  const resolver = (times, delay) => {
    const result = Promise.try(action);
    return times <= 0
      ? result
      : result
          .catch(() => Promise.delay(delay))
          .then(() => resolver(times - 1, delay * opts.delayModifier));
  };

  return resolver(opts.times, opts.delay);
};

export default {
  composeP,
  flowP,
  allP,
  joinP,
  joinP2,
  mapP,
  mapP2,
  flatMapP,
  reduceP,
  promisify,
  tapP,
  retry,
};
