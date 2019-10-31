import {curry, get, uniq} from "lodash/fp";
import request from "request";
import fs from "fs";
import {parseISO} from "date-fns";
import {mkdirP} from "@sugarcube/plugin-fs";
import {runCmd} from "@sugarcube/utils";

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
        .on("response", res => res.pipe(fs.createWriteStream(to))),
    ),
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

  return runCmd(cmd, args);
});

const maybeGet = keys => meta => {
  const value = keys.reduce((memo, key) => {
    if (memo != null) return memo;
    const val = get(key, meta);
    if (val === "") return memo;
    if (Array.isArray(val) && val.filter(v => v !== "").length === 0)
      return memo;
    return Array.isArray(val) ? uniq(val).join(", ") : val;
  }, null);
  return value === "" ? null : value;
};

export const getAuthor = maybeGet([
  "Author",
  "creator",
  "og:site_name",
  "article:publisher",
  "twitter:site",
]);
export const getTitle = maybeGet([
  "title",
  "og:title",
  "twitter:title",
  "dc:title",
]);
export const getDescription = maybeGet([
  "description",
  "og:description",
  "twitter:description",
]);
export const getLanguage = maybeGet([
  "language",
  "Content-Language",
  "og:locale",
]);
export const getCreated = meta => {
  let createdAt;
  const created = maybeGet([
    "created",
    "date",
    "article:published_time",
    "modified",
    "date",
    "article:modified_time",
  ])(meta);

  if (created != null) {
    try {
      createdAt = parseISO(created);
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }

  return createdAt;
};

export default {
  assertDir,
  download,
  wget,
  getAuthor,
  getTitle,
  getDescription,
  getLanguage,
  getCreated,
};
