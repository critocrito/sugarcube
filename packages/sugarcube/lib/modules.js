import {flow, filter, keys, property, startsWith} from "lodash/fp";
import path from "path";

export default flow([
  // eslint-disable-next-line import/no-dynamic-require, global-require
  () => require(path.resolve(__dirname, "..", "package.json")),
  property("dependencies"),
  keys,
  filter(startsWith("@sugarcube/plugin")),
]);
