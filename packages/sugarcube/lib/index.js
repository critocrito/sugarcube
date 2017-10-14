import {flow, reduce, merge} from "lodash/fp";
import sc from "@sugarcube/core";
import modules from "./modules";

export {
  runner,
  queries,
  data,
  envelope,
  plugin,
  utils,
  test,
} from "@sugarcube/core";

export const plugins = flow([
  modules,
  // eslint-disable-next-line global-require, import/no-dynamic-require
  reduce((memo, module) => merge(memo, require(module).plugins), {}),
])();

export default merge(sc, {plugins});
