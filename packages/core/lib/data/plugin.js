import {foldP, liftP2} from "dashp";

import {curry3} from "../utils";

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
export const liftManyA2 = curry3("liftManyA2", (fs, a, b) =>
  foldP((memo, f) => liftP2(f, memo, b), a, fs),
);

export default {liftManyA2};
