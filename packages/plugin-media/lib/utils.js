import {curry} from "lodash/fp";
import {spawn} from "child-process-promise";
import {retry} from "dashp";

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

export default {
  youtubeDl,
};
