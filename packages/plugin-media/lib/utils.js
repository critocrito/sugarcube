import {spawn} from "child_process";
import {retry} from "dashp";

const doit = (cmd, args) =>
  // eslint-disable-next-line promise/avoid-new
  new Promise((resolve, reject) => {
    const run = spawn(cmd, args);
    const errMsg = [];

    const makeError = messages => {
      const msg = messages.map(m => m.trim().replace(/\n$/, "")).join(" ");
      return new Error(msg);
    };

    run.stderr.on("data", d => errMsg.push(d.toString()));
    run.on("error", () => reject(makeError(errMsg)));
    run.on("close", code => {
      if (code === 0) resolve();
      reject(makeError(errMsg));
    });
  });

export const youtubeDl = (cmd, videoFormat, href, target) => {
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

  return retry(() => doit(cmd, args));
};

export const youtubeDlCheck = (cmd, href) => {
  const args = ["-s", href];

  return doit(cmd, args);
};

export default {
  youtubeDl,
  youtubeDlCheck,
};
