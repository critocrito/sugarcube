import {curry} from "lodash/fp";
import Promise from "bluebird";

import {reduceP} from "../utils/combinators";

// A sugarcube plugin has one of the following types:
//    a -> Future a
//    a -> a
// Plugins that don't return a future, are coerced into a version with a future.
// Each plugin is an instance of a Functor and Applicative Functor.

// future :: a -> Future a
// This just a shorthand function, makes for concise code later on.
const future = Promise.resolve;

/**
 * A promised identity function.
 *
 * `id :: a -> Future a`
 *
 * @param {Any} The value to returns.
 * @returns {Promise.<Any>} A promise of the value that was supplied.
 */
export const id = future;

/**
 * Map a function over a Functor
 *
 * `fmap :: Functor f => (a -> Future b) -> f (Future a) -> Future b`
 * `fmap :: Functor f => (a -> b) -> f a -> Future b`
 *
 * @param {Function} f The function to apply to the Functor.
 * @param {Promise|Any} p The functor value to map.
 * @returns {Promise} A promise resolving to the value of p mapped over f.
 * @example
 * const p = () => Promise.resolve(1);
 * const f = v => v + 1;
 * fmap(f, p);  // Returns a promise resolving to 2.
 */
export const fmap = curry((f, p) => future(p).then(f));

/**
 * Lift a value into an applicative.
 *
 * `pure :: Applicative f => a -> f (Future a)`
 *
 * @param {Any} a The value to lift.
 * @returns {Promise} A promise that resolves to a.
 */
export const pure = future;

/**
 * Apply a function wrapped in a promise to a promisified value.
 *
 * `apply :: Applicative f => f (a -> Future b) -> f (Future a) -> f (Future b)`
 * `apply :: Applicative f => f (a -> b) -> f a -> f (Future b)`
 *
 * @param {Promise.<Function>} pf A promise that resolves to a function.
 * @param {Promise.<Any>} p A promise that resolves to a value.
 * @returns {Promise.<Any>} A promise resolving to p applied to the function
 * that pf resolves to.
 * @example
 * const pf = Promise.resolve(v => v + 1);
 * const p = Promise.resolve(1);
 * apply(pf, p); // Returns a promise resolving to 2.
 */
export const apply = curry((pf, p) => fmap(f => fmap(f, p), pf));

/**
 * Lift a binary function over two Applicative.
 *
 * `liftA2 :: Applicative f => f (a -> b -> Future c) -> f (Future a)
 *                             -> f (Future b) -> f (Future c)`
 * `liftA2 :: Applicative f => f (a -> b -> Future c) -> f a -> f b -> f (Future c)`
 *
 * @param {Function.<Any, Any>} f A binary function.
 * @param {Promise.<Any>} a A promise that resolves to a value.
 * @param {Promise.<Any>} b A promise that resolves to a value.
 * @returns {Promise.<Any>} The value that f returns when applied to a and b.
 * @example
 * const a = Promise.resolve(envelope);
 * const b = Promise.resolve(env);
 * liftA2(plugin, a, b); // Calls plugin with the value that a and b resolve to.
 */
export const liftA2 = curry((f, a, b) => apply(fmap(x => y => f(x, y), a), b));

/**
 * Lift many binary functions over two Applicatives.
 *
 * ```
 * liftManyA2 :: Applicative f => [f (a -> b -> Future c)] -> f (Future a)
 *                                -> f (Future b) -> f (Future c)
 * liftManyA2 :: Applicative f => [f (a -> b -> Future c)] -> f a -> f b
 *                                -> f (Future c)
 * ```
 * @param {Array.<Function>} fs A list of binary functions.
 * @param {Promise.<Any>} a A promise that resolves to a value.
 * @param {Promise.<Any>} b A promise that resolves to a value.
 * @returns {Promise.<Any>} The value that that returns when reducing `a` and
 * `b` over `fs`.
 * @example
 * const a = Promise.resolve(envelope);
 * const b = Promise.resolve(env);
 * liftManyA2([f1, f2], a, b); // f1(a,b).then(r => f2(r, b)).then(...)
 */
export const liftManyA2 = curry((fs, a, b) =>
  reduceP((memo, f) => liftA2(f, memo, b), a, fs)
);

export default {
  id,
  fmap,
  pure,
  apply,
  liftA2,
  liftManyA2,
};
