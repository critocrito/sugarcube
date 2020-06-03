import fs from "fs";
import {curry} from "lodash/fp";
import request from "request";
import {mkdirP} from "@sugarcube/plugin-fs";
import fetch from "node-fetch";
import contentType from "content-type";
import {extract, tikaMetaFields, runCmd} from "@sugarcube/utils";

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

export const urlContentType = async url => {
  const resp = await fetch(url, {method: "HEAD"});
  if (!resp.ok) {
    // throw new Error(`${resp.status}: ${resp.statusText}`);
    return null;
  }
  const header = resp.headers.get("Content-Type");
  if (header == null) return null;

  // The content type parser throws on content types of the form 'image/gif;' if
  // nothing follows the last semi colon.
  let type;
  try {
    const parseContent = contentType.parse(header.replace(/;$/, ""));
    // eslint-disable-next-line prefer-destructuring
    type = parseContent.type;
  } catch (e) {
    return null;
  }

  if (type.startsWith("text")) return "url";
  if (type.startsWith("image")) return "image";
  if (type.startsWith("video")) return "video";

  return "document";
};

export const basicImport = async location => {
  const contents = await extract(location);
  const {text, meta} = contents;

  return {
    body: text == null || text === "" ? null : text.trim(),
    ...tikaMetaFields(meta),
  };
};

export const hypercubeImport = async (browse, target, location) => {
  const images = [];
  let content;

  await browse(async ({goto, page}) => {
    // We capture requests for images and add them to _sc_media.
    page.on("response", response => {
      const headers = response.headers();
      if (headers["content-type"] == null) return;
      let type;
      try {
        const parseContent = contentType.parse(
          headers["content-type"].replace(/;$/, ""),
        );
        // eslint-disable-next-line prefer-destructuring
        type = parseContent.type;
      } catch (e) {
        return;
      }

      if (
        ["image/png", "image/jpeg", "image/jpg"].includes(type) &&
        response.url().startsWith("http")
      )
        images.push({type: "image", term: response.url()});
    });

    await goto(location);
    await page.waitFor(1 * 1000);

    content = await page.content();
  });
  fs.writeFileSync(target, content);

  const unit = await basicImport(target);

  return [unit, images];
};

export default {
  assertDir,
  download,
  wget,
};
