import {utils} from "@sugarcube/core";

const {assertCfg} = utils.assertions;

export const assertAppCredentials = assertCfg([
  "facebook.app_id",
  "facebook.app_secret",
]);

export default {
  assertAppCredentials,
};
