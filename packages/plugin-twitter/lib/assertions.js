import {utils} from "@sugarcube/core";

const {assertCfg} = utils.assertions;

export const assertCredentials = assertCfg([
  "twitter.consumer_key",
  "twitter.consumer_secret",
  "twitter.access_token_key",
  "twitter.access_token_secret",
]);

export const assertRecurseDepth = assertCfg(["twitter.recurse_depth"]);

export default {
  assertCredentials,
  assertRecurseDepth,
};
