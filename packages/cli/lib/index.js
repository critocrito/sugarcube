import {
  curry,
  flow,
  reduce,
  merge,
  concat,
  omit,
  getOr,
  first,
  isArray,
} from "lodash/fp";
import fs from "fs";
import stripComments from "strip-json-comments";
import {utils} from "@sugarcube/core";

const {arrayify} = utils;

// Read a file and parse it in the JSON format with the comment extensions.
const readParseJson = flow([
  p => fs.readFileSync(p, "utf-8"),
  stripComments,
  JSON.parse,
]);

/**
 * A basic config file parser.
 * @param {string} path The path to the configuration file.
 * @throws Will throw an error if the file is missing or the JSON is invalid.
 * @returns {Object|Array} The parsed JSON.
 */
export const parseConfigFile = path => {
  try {
    return readParseJson(path);
  } catch (e) {
    throw new Error(`Invalid JSON config file: ${path}`);
  }
};

/**
 * Reads a config file like `parseConfigFile`, but supports the `extends`
 * keyword similar to eslint. Only use it on configuration files that contain
 * an object, not an array of objects.
 * @param {string} path The path to the configuration file.
 * @throws Will throw an error if the file is missing or the JSON is invalid.
 * @returns {Object} The parsed JSON.
 */
export const parseConfigFileWithExtends = path => {
  const cfg = parseConfigFile(path);
  const configExtends = getOr([], "extends", cfg);

  return flow([
    arrayify,
    reduce(
      (memo, extend) => merge(parseConfigFileWithExtends(extend), memo),
      cfg
    ),
    omit(["extends"]),
  ])(configExtends);
};

/**
 * Map a config parser over multiple files.
 * @param {Function} f The config file parser function.
 * @param {string|Array.<string>} ps A single or a list of file paths.
 * @throws Will throw an error if any file is missing or the JSON is invalid.
 * @returns {Object|Array} The concatenation of all config files. An array if
 * the first config file parses as an array, otherwise and object.
 */
export const mapFiles = curry((f, ps) => {
  const configs = [];
  for (let i = 0; i < ps.length; i += 1) {
    configs.push(f(ps[i]));
  }
  const [merger, acc] = isArray(first(configs)) ? [concat, []] : [merge, {}];
  return reduce(merger, acc, configs);
});

export default {
  readParseJson,
  parseConfigFile,
  parseConfigFileWithExtends,
  mapFiles,
};
