import {spawn} from "child-process-promise";
import {utils} from "@sugarcube/core";

const {assertCfg} = utils.assertions;
const {retry} = utils.combinators;

export const assertCredentials = assertCfg(["youtube.api_key"]);

export const youtubeDl = (cmd, videoFormat, href, target) => {
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
};

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
