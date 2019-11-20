import {get} from "lodash/fp";
import {utils} from "@sugarcube/core";

const {
  curry4,
  assertions: {assertCfg},
} = utils;

export const assertCfgOptions = curry4(
  "assertCfgOptions",
  (expected, options, envelope, env) => {
    const {cfg} = env;
    assertCfg([expected], envelope, env);
    if (!options.includes(get(expected, cfg))) {
      throw new Error(
        `Configuration option ${expected} can only be one of: ${options.join(
          ", ",
        )}`,
      );
    }
    return envelope;
  },
);
