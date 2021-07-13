import fs from "fs";
import {retry} from "dashp";
import fetch from "node-fetch";
import fileType from "file-type";
import {runCmd} from "@sugarcube/utils";

export const youtubeDl = (cmd, videoFormat, href, target, sourceIp) => {
  const args = [
    href,
    "-f",
    videoFormat,
    "--max-downloads",
    "1",
    "--write-thumbnail",
    "--all-subs",
    "-o",
    "'%(id)s.%(ext)s'",
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

  if (!resp.ok)
    return Promise.reject(new Error(`Failed to fetch ${from}: ${resp.status}`));

  return new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(to);

    resp.body.on("error", e => reject(e));
    dest.on("error", e => reject(e));
    dest.on("finish", () => resolve());

    resp.body.pipe(dest);
  });
};

export const guessFileType = async location => {
  const read = fs.createReadStream(location);
  const {fileType: ft} = await fileType.stream(read);
  read.destroy();
  if (ft != null && ft.ext) return `.${ft.ext}`;
  return "";
};
