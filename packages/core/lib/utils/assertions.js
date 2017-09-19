import {curry, reduce, get, concat, isEmpty} from "lodash/fp";

import {queriesByType} from "../data/envelope";

// TODO: Deprecated. Better use a sort of validation.
export const assertCfg = curry((expected, envelope, {cfg}) => {
  const errors = reduce(
    (memo, e) => {
      if (!get(e, cfg)) {
        return concat(memo, [e]);
      }
      return memo;
    },
    [],
    expected
  );

  if (!isEmpty(errors)) {
    throw new Error(`Missing configuration options: ${errors.join(", ")}`);
  }
  return envelope;
});

export const assertQuery = curry((type, envelope) => {
  if (isEmpty(queriesByType(type, envelope))) {
    throw new Error(`Query type ${type} not found.`);
  }
  return envelope;
});

export default {
  assertCfg,
  assertQuery,
};
