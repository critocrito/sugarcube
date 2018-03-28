import {curry} from "lodash/fp";
import {spawn} from "child-process-promise";
import {retry} from "dashp";

export const youtubeDl = curry((debug, cmd, videoFormat, href, target) => {
  const args = [
    href,
    "-f",
    videoFormat,
    "--max-downloads",
    "1",
    "--write-all-thumbnails",
    "--all-subs",
    "-o",
    target,
  ];

  return retry(() => {
    const promise = spawn(cmd, debug ? args.concat("-v") : args);
    if (debug) {
      // eslint-disable-next-line no-console
      promise.childProcess.stdout.on("data", d => console.log(d.toString()));
      // eslint-disable-next-line no-console
      promise.childProcess.stderr.on("data", d => console.error(d.toString()));
    }
    return promise;
  });
});

export default {
  youtubeDl,
};
