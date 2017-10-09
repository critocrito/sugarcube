import {merge} from "lodash/fp";
import runner from "./runner";
// eslint-disable-next-line import/no-named-as-default
import envelope from "./data/envelope";
import queries from "./data/list";
import data from "./data/data";
import plugin from "./data/plugin";
import u from "./utils";
import hasher from "./utils/hasher";
import assertions from "./utils/assertions";
import fs from "./utils/fs";
import generators from "./test/generators";

const utils = merge(u, {hasher, assertions, fs});
const test = {generators};

export {runner, queries, data, envelope, plugin, utils, test};

export default {
  runner,
  queries,
  data,
  envelope,
  plugin,
  utils,
  test,
};
