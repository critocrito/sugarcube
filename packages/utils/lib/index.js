import tika from "@conscia/tika";
import {spawn} from "child_process";

export const runCmd = (cmd, args) =>
  // eslint-disable-next-line promise/avoid-new
  new Promise((resolve, reject) => {
    const outMsg = [];
    const errMsg = [];
    const run = spawn(cmd, args);

    const fmtError = messages => {
      const msg = messages.map(m => m.trim().replace(/\n$/, "")).join(" ");
      return Error(msg);
    };

    const fmtOut = messages =>
      messages.map(m => m.trim().replace(/\n$/, "")).join(" ");

    run.stdout.on("data", d => outMsg.push(d.toString()));
    run.stderr.on("data", d => errMsg.push(d.toString()));
    run.on("error", err => {
      errMsg.push(err.message);
      return reject(fmtError(errMsg));
    });
    run.on("close", code => {
      if (code === 0) return resolve(fmtOut(outMsg));
      return reject(fmtError(errMsg));
    });
  });

export const counter = (total, log, {threshold = 100, steps = 50} = {}) => {
  let cnt = 0;

  return () => {
    cnt += 1;
    const percent = Math.floor((cnt / total) * 100);
    const shouldLog = cnt % steps === 0;
    if (total >= threshold && shouldLog) log({total, cnt, percent});
  };
};

export const extract = (location, opts = {}) => {
  return new Promise((resolve, reject) => {
    tika.extract(location, opts, (err, text, meta) => {
      if (err) reject(err);
      resolve({text, meta});
    });
  });
};

export default {
  runCmd,
  counter,
  extract,
};
