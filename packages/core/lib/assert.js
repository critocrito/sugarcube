import {reduce, get, concat, isEmpty} from "lodash/fp";

import {queriesByType} from "./data/envelope";
import {curry2, curry3} from "./utils";

// TODO: Deprecated. Better use a sort of validation.
export const assertCfg = curry3("assertCfg", (expected, envelope, {cfg}) => {
  const errors = reduce(
    (memo, e) => {
      if (!get(e, cfg)) {
        return concat(memo, [e]);
      }
      return memo;
    },
    [],
    expected,
  );

  if (!isEmpty(errors)) {
    throw new Error(`Missing configuration options: ${errors.join(", ")}`);
  }
  return envelope;
});

export const assertQuery = curry2("assertQuery", (type, envelope) => {
  if (isEmpty(queriesByType(type, envelope))) {
    throw new Error(`Query type ${type} not found.`);
  }
  return envelope;
});

export default {
  assertCfg,
  assertQuery,
};
