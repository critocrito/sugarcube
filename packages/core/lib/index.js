import {merge, pick} from "lodash/fp";
import runner from "./runner";
// eslint-disable-next-line import/no-named-as-default
import envelope from "./data/envelope";
import queries from "./data/list";
import data from "./data/data";
import plugin from "./data/plugin";
import u from "./utils";
import hasher from "./utils/hasher";
import assertions from "./utils/assertions";

const utils = merge(u, {hasher, assertions});
const crypto = pick(["sha1", "sha256", "uid", "generateSeed"], hasher);

export {runner, queries, data, envelope, plugin, utils, crypto};

export default {
  runner,
  queries,
  data,
  envelope,
  plugin,
  utils,
  crypto,
};
