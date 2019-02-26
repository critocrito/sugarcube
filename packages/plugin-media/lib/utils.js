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

export const mosaicSceneChange = (cmd, source, dest, force = false) => {
  const args = [
    "-i",
    source,
    "-frames:v",
    "1",
    "-vf",
    // prettier-ignore
    // eslint-disable-next-line no-useless-escape
    "select='gt(scene\,0.4)',scale=160:120,tile",
    dest,
  ];

  return doit(cmd, force ? ["-y"].concat(args) : args);
};

export const mosaicNthFrame = (cmd, source, dest, force = false) => {
  const args = [
    "-ss",
    "00:00:05",
    "-i",
    source,
    "-frames",
    "1",
    "-vf",
    // prettier-ignore
    // eslint-disable-next-line no-useless-escape
    "select='not(mod(n\,400))',scale=160:120,tile=4x3",
    dest,
  ];

  return doit(cmd, force ? ["-y"].concat(args) : args);
};

export default {
  youtubeDl,
  youtubeDlCheck,
  mosaicSceneChange,
  mosaicNthFrame,
};
