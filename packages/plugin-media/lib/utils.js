import {spawn} from "child-process-promise";
import {retry} from "dashp";

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

  return retry(
    () =>
      // eslint-disable-next-line promise/avoid-new
      new Promise(async (resolve, reject) => {
        const promise = spawn(cmd, args);
        const errMsg = [];

        promise.childProcess.stderr.on("data", d => errMsg.push(d.toString()));

        try {
          await promise;
          resolve();
        } catch (e) {
          const msg = errMsg.map(m => m.trim().replace(/\n$/, "")).join(" ");
          reject(new Error(msg));
        }
      }),
  );
};

export const youtubeDlCheck = (cmd, href) => {
  const args = ["-s", href];

  // eslint-disable-next-line promise/avoid-new
  return new Promise(async (resolve, reject) => {
    const promise = spawn(cmd, args);
    const errMsg = [];

    promise.childProcess.stderr.on("data", d => errMsg.push(d.toString()));

    try {
      await promise;
      resolve();
    } catch (e) {
      const msg = errMsg.map(m => m.trim().replace(/\n$/, "")).join(" ");
      reject(new Error(msg));
    }
  });
};

export default {
  youtubeDl,
  youtubeDlCheck,
};
