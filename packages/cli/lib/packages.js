import {
  flow,
  map,
  filter,
  reject,
  reduce,
  merge,
  keys,
  property,
} from "lodash/fp";
import path from "path";
import {readdirSync} from "fs";

import {instruments as localInstruments} from "./instruments";

export const load = f =>
  reduce((memo, mod) => {
    // Rename paths to a prettier naming scheme
    // node_modules/@sugarcube/plugin-xxx -> plugin-xxx
    // sugarcube-plugin-xxx -> plugin-xxx
    const name = mod.match(/[^/]+$/g)[0].replace(/^sugarcube-/, "");
    return merge(memo, {[name]: f(mod)});
  }, {});

export const loadPackageJson = flow([
  // eslint-disable-next-line import/no-dynamic-require, global-require
  () => require(`${path.join(process.cwd(), "package")}`),
  property("dependencies"),
  keys,
  filter(p => /^sugarcube-/.test(p)),
  map(m => path.join(process.cwd(), "node_modules", m)),
  load(require),
]);

export const loadBuiltinModules = () => {
  const builtinPath = "node_modules/@sugarcube";
  return flow([
    () => readdirSync(`${path.join(process.cwd(), builtinPath)}`),
    // Don't include the @sugarcube/sugarcube special package
    reject(p => /sugarcube$/.test(p)),
    map(m => path.join(process.cwd(), builtinPath, m)),
    load(require),
  ])();
};

// eslint-disable-next-line import/no-mutable-exports
export let modules = () => {
  const packages = merge(loadBuiltinModules(), loadPackageJson());
  // Memoize the result of the package loading.
  modules = () => ({
    packages,
    plugins: () =>
      Object.keys(packages).reduce(
        (memo, key) => merge(memo, packages[key].plugins || {}),
        {},
      ),
    features: () =>
      Object.keys(packages).reduce(
        (memo, key) => merge(memo, packages[key].features || {}),
        {},
      ),
    instruments: () =>
      Object.keys(packages).reduce(
        (memo, key) => merge(memo, packages[key].instruments || {}),
        localInstruments,
      ),
  });
  return modules();
};
