import fs from "fs";
import {retry} from "dashp";
import fetch from "node-fetch";
import {runCmd} from "@sugarcube/utils";

export const youtubeDl = (cmd, videoFormat, href, target, sourceIp) => {
  const args = [
    href,
    "-f",
    videoFormat,
    "--max-downloads",
    "1",
    "--write-all-thumbnails",
    "--all-subs",
  ]
    .concat(sourceIp == null ? [] : ["--source-address", sourceIp])
    .concat(["-o", target]);

  return retry(() => runCmd(cmd, args));
};

export const youtubeDlCheck = (cmd, href, sourceIp) => {
  const args = ["-s", href].concat(
    sourceIp == null ? [] : ["--source-address", sourceIp],
  );

  return runCmd(cmd, args);
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

  return runCmd(cmd, force ? ["-y"].concat(args) : args);
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

  return runCmd(cmd, force ? ["-y"].concat(args) : args);
};

export const ffmpeg = (cmd, source, dest, force = false) => {
  const args = ["-i", source, dest];

  return runCmd(cmd, force ? ["-y"].concat(args) : args);
};

export const random = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

export const download = async (from, to) => {
  const resp = await fetch(from);
  const dest = fs.createWriteStream(to);
  resp.body.pipe(dest);
  return new Promise((resolve, reject) => {
    resp.body.on("end", () => resolve());
    dest.on("error", e => reject(e));
  });
};
