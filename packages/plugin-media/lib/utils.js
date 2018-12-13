import {spawn} from "child_process";
import {retry} from "dashp";

const doit = (cmd, args) =>
  // eslint-disable-next-line promise/avoid-new
  new Promise((resolve, reject) => {
    const run = spawn(cmd, args);
    const errMsg = [];

    run.stderr.on("data", d => errMsg.push(d.toString()));
    run.on("error", () => {
      const msg = errMsg.map(m => m.trim().replace(/\n$/, "")).join(" ");
      reject(new Error(msg));
    });
    run.on("close", () => resolve());
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
