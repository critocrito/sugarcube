import {
  flow,
  map,
  filter,
  reduce,
  merge,
  keys,
  property,
  startsWith,
} from "lodash/fp";
import path from "path";
import {readdirSync} from "fs";

export const loadModule = name =>
  // eslint-disable-next-line global-require, import/no-dynamic-require
  require(name).plugins || {};

export const loadModulePath = name =>
  loadModule(path.join(process.cwd(), name));

export const load = f => reduce((memo, name) => merge(memo, f(name)), {});

/**
 * Load all sugarcube plugins from the local package.json. Each package has to
 * start with `sugarcube-plugin` as name.
 * @returns {Object} dependencies A list of plugin names.
 */
export const loadPackageJson = flow([
  // eslint-disable-next-line import/no-dynamic-require, global-require
  () => require(`${path.join(process.cwd(), "package")}`),
  property("dependencies"),
  keys,
  filter(startsWith("sugarcube-plugin")),
  map(m => path.join("node_modules", m)),
  load(loadModulePath),
]);

/**
 * Load all builtin sugarcube plugins found in the `node_modules/@sugarcube`
 * directory.
 * @returns {Object} dependencies A list of plugins.
 */
export const loadBuiltinModules = () => {
  const builtinPath = "node_modules/@sugarcube";
  return flow([
    () => readdirSync(`${path.join(process.cwd(), builtinPath)}`),
    filter(startsWith("plugin")),
    map(m => path.join(builtinPath, m)),
    load(loadModulePath),
  ])();
};

/**
 * Load all plugins available for this sugarcube installation. This looks up
 * builtin plugins (in `node_modules/@sugarcube`) and any custom plugin
 * defined in the `package.json` with a name starting with `sugarcube-plugin`.
 *
 * @returns {Object} An object with the plugin name as key, and the plugin
 * function as value.
 * @example
 * const plugins = load();
 */
export const loadModules = () => merge(loadBuiltinModules(), loadPackageJson());
