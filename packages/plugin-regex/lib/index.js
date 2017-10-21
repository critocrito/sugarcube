import {plugin} from "@sugarcube/core";
import matchPlugin from "./plugins/match";
import assertField from "./assertions";

export const plugins = {
  regex_match: plugin.liftManyA2([assertField, matchPlugin]),
};

export default {plugins};
