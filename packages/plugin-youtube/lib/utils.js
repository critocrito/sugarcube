import {curry} from "lodash/fp";
import {spawn} from "child-process-promise";
import {utils} from "@sugarcube/core";
import {retry} from "dashp";

const {assertCfg} = utils.assertions;

export const assertCredentials = assertCfg(["youtube.api_key"]);

export const youtubeDl = curry((cmd, videoFormat, href, target) => {
  const args = [
    href,
    "-f",
    videoFormat,
    "--write-all-thumbnails",
    "--all-subs",
    "-o",
    target,
  ];

  return retry(() => spawn(cmd, args));
});

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
  youtubeDl,
  Counter,
};
