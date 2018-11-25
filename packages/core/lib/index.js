import {merge} from "lodash/fp";
import runner from "./runner";
// eslint-disable-next-line import/no-named-as-default
import envelope from "./data/envelope";
import queries from "./data/list";
import data from "./data/data";
import plugin from "./data/plugin";
import utilsA from "./utils";
import assert from "./assert";
import crypto from "./crypto";
import {state} from "./state";
import createFeatureDecisions from "./features";

const utils = merge(utilsA, {assertions: assert});

export {
  runner,
  queries,
  data,
  envelope,
  plugin,
  utils,
  assert,
  crypto,
  state,
  createFeatureDecisions,
};

export default {
  runner,
  queries,
  data,
  envelope,
  plugin,
  utils,
  assert,
  crypto,
  state,
  createFeatureDecisions,
};
