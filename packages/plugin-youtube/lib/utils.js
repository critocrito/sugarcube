import {utils} from "@sugarcube/core";

const {assertCfg} = utils.assertions;

export const assertCredentials = assertCfg(["youtube.api_key"]);

export function Counter(total) {
  this.beginning = 0;
  this.total = total;
  this.count = () => {
    this.beginning += 1;
    return this.beginning;
  };
}

export default {
  assertCredentials,
  Counter,
};
