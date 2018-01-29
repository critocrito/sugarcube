import {utils} from "@sugarcube/core";

const {assertCfg} = utils.assertions;

export const assertFrom = assertCfg(["mail.from"]);

export default {assertFrom};
