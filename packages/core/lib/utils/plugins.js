import {
  flow,
  map,
  filter,
  reduce,
  merge,
  concat,
  keys,
  compact,
  property,
  first,
  startsWith,
} from "lodash/fp";
import path from "path";
import {readdirSync} from "fs";

const mapObj = map.convert({cap: false});

/**
 * List all sugarcube plugins from the local package.json.
 * @returns {Array.<string>} dependencies A list of plugin names.
 */
export const listPackageJson = flow([
  // eslint-disable-next-line import/no-dynamic-require, global-require
  () => require(`${path.join(process.cwd(), "package")}`),
  property("dependencies"),
  keys,
  filter(startsWith("sugarcube-plugin")),
]);

/**
 * List all sugarcube plugins found in the `node_modules` directory.
 * @returns {Array.<string>} dependencies A list of plugin names.
 */
export const listNodeModules = flow([
  () => readdirSync(`${path.join(process.cwd(), "node_modules")}`),
  filter(startsWith("sugarcube-plugin")),
]);

/**
 * The default listing of plugins. Basically if it's in node_modules, it is
 * available.
 * @returns {Array.<string>} dependencies A list of plugin names.
 */
export const list = listNodeModules;

/**
 * Load all plugins available for this sugarcube installation.
 *
 * @param {Array.<string>} deps A list of names of plugins to load.
 * @throws If any dependency in `package.json` isn't installed or a plugin in
 * the config isn't available.
 * @returns {Array<Array.<Object>, Array.<string>>} The plugins object and a
 * list of modules that could not be loaded.
 * @example
 * const [plugins, missing] = load(list());
 */
export const load = deps =>
  reduce(
    ([ts, ms], name) => {
      const moduleName = `${process.cwd()}/node_modules/${name}`;
      let module = {};

      try {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        module = require(moduleName);
      } catch (e) {
        return [ts, concat(ms, [name])];
      }

      return [merge(ts, module.plugins || {}), ms];
    },
    [{}, []],
    deps
  );

/**
 * Return all available options for all available plugins.
 *
 * @returns {Object} options The options of every plugin.
 */
export const options = flow([list, load, first, mapObj(p => p.argv), compact]);
export default {
  list,
  listPackageJson,
  listNodeModules,
  load,
  options,
};
