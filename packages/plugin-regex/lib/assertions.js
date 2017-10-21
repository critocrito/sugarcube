import {utils} from "@sugarcube/core";

const {assertCfg} = utils.assertions;

const assertField = assertCfg(["regex.field"]);

export default assertField;
