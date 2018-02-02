import {curry} from "lodash/fp";
import request from "request";
import fs from "fs";
import {spawn} from "child-process-promise";
import {mkdirP} from "@sugarcube/plugin-fs";

export const assertDir = (envelope, {cfg}) => {
  const dir = cfg.http.data_dir;
  return mkdirP(dir).then(() => envelope);
};

export const download = curry(
  (from, to) =>
    // eslint-disable-next-line promise/avoid-new
    new Promise((resolve, reject) =>
      request(from)
        .on("end", resolve)
        .on("error", reject)
        .on("response", res => res.pipe(fs.createWriteStream(to)))
    )
);

export const wget = curry((cmd, target, term) => {
  const args = [
    "-q",
    "--no-check-certificate",
    "-e",
    "robots=off",
    "--page-requisites",
    "--adjust-extension",
    "--convert-links",
    "--no-clobber",
    "--directory-prefix",
    target,
    term,
  ];

  const p = spawn(cmd, args);
  const {childProcess} = p;
  // If I don't do that, the process gets stuck.
  childProcess.stdout.on("data", d => d.toString());
  childProcess.stderr.on("data", d => d.toString());

  return Promise.resolve(p);
});

export default {
  assertDir,
  download,
  wget,
};
