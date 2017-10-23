import {merge} from "lodash/fp";
import Promise from "bluebird";
import request from "request";
import {join, basename} from "path";
import url from "url";
import fs from "fs";
import {spawn} from "child-process-promise";
import {mkdirP, sha256sum} from "@sugarcube/plugin-fs";

Promise.promisifyAll(fs);

export const assertDir = (envelope, {cfg}) => {
  const dir = cfg.http.download_dir;
  return mkdirP(dir).return(envelope);
};

export const download = (dir, d) => {
  if (!d.term) return Promise.resolve(d);

  const fileName = basename(url.parse(d.term).pathname);
  const location = join(dir, fileName);

  const fetchFile = (href, target) =>
    // eslint-disable-next-line promise/avoid-new
    new Promise((resolve, reject) =>
      request(href)
        .on("end", resolve)
        .on("error", reject)
        .on("response", res => res.pipe(fs.createWriteStream(target)))
    ).then(() => sha256sum(target));

  return mkdirP(dir)
    .then(() => sha256sum(location))
    .catch(e => {
      if (e.code === "ENOENT") return fetchFile(d.term, location);
      throw e;
    })
    .then(sha256 => merge(d, {location, sha256}));
};

export const wget = (cmd, target, {term}) => {
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
};

export default {
  assertDir,
  download,
  wget,
};
