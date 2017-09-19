import {size, merge, isEqual, every} from "lodash/fp";
import Promise from "bluebird";
import {assertForall, array, dict, string} from "jsverify";
import {id, fmap, pure, apply, liftA2, liftManyA2} from "../lib/data/plugin";
import {composeP} from "../lib/utils/combinators";
import {asyncFn2} from "./arbitraries";

describe("SugarCube plugin", () => {
  it("has an identity element", () =>
    assertForall(dict(string), a => id(a).then(r => isEqual(r, a))));

  // fmap id === id
  it("holds for the first functor law", () =>
    assertForall(dict(string), a => {
      const x = Promise.resolve(a);

      return Promise.all([fmap(id, x), id(a)]).spread(isEqual);
    }));

  // fmap f . fmap g === fmap (f . g)
  it("holds for the second functor law", () =>
    assertForall(dict(string), dict(string), dict(string), (a, b, c) => {
      const f = r => Promise.resolve(merge(r, a));
      const g = r => Promise.resolve(merge(r, b));
      const x = Promise.resolve(c);

      return Promise.all([fmap(f, fmap(g, x)), fmap(composeP(f, g), x)]).spread(
        isEqual
      );
    }));

  // pure id <*> v = v
  it("holds for the law of identity for applicative", () =>
    assertForall(dict(string), a => {
      const v = pure(a);

      return Promise.all([apply(pure(id), v), v]).spread(isEqual);
    }));

  // pure f <*> pure x = pure (f x)
  it("holds for the law of homomorphism for applicative", () =>
    assertForall(dict(string), dict(string), (a, b) => {
      const f = merge(a);

      return Promise.all([apply(pure(f), pure(b)), pure(f(b))]).spread(isEqual);
    }));

  // u <*> pure y = pure ($ y) <*> u
  it("holds for the law of interchange for applicatives", () =>
    assertForall(dict(string), dict(string), (a, b) => {
      const u = pure(merge(a));
      const y = b;

      return Promise.all([apply(u, pure(b)), apply(pure(f => f(y)), u)]).spread(
        isEqual
      );
    }));

  // pure (.) <*> u <*> v <*> w = u <*> (v <*> w)
  it("holds for the law of composition for applicatives", () =>
    assertForall(dict(string), dict(string), dict(string), (a, b, c) => {
      const u = pure(merge(a));
      const v = pure(merge(b));
      const w = pure(c);

      return Promise.all([
        apply(apply(apply(pure(composeP), u), v), w),
        apply(u, apply(v, w)),
      ]).spread(isEqual);
    }));

  // fmap f x = pure f <*> x
  it("holds for the relation between fmap and apply", () =>
    assertForall(dict(string), dict(string), (a, b) => {
      const f = merge(a);
      const p = Promise.resolve(b);

      return Promise.all([fmap(f, p), apply(pure(f), p)]).spread(isEqual);
    }));

  it("lifts binary plugins to actions", () =>
    assertForall(dict(string), dict(string), (a, b) => {
      const pluginP = (x, y) => Promise.resolve(merge(x, y));
      const plugin = merge;

      // async and non async.
      return Promise.all([
        liftA2(pluginP, pure(a), pure(b)),
        liftA2(plugin, a, b),
      ]).then(every(isEqual(merge(a, b))));
    }));

  it("lifts many binary functions to actions", () =>
    assertForall(array(asyncFn2), fs =>
      liftManyA2(fs, 0, 1).then(r => isEqual(r, size(fs)))
    ));
});
