import fs from "fs";
import {promisify} from "util";
import path from "path";
import {get, uniq} from "lodash/fp";
import {parseISO} from "date-fns";
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

export const mkdirP = dir =>
  promisify(fs.mkdir)(dir).catch(err => {
    switch (err.code) {
      case "EEXIST":
        return Promise.resolve();
      case "ENOENT":
        // eslint-disable-next-line promise/no-nesting
        return mkdirP(path.dirname(dir)).then(() => mkdirP(dir));
      default:
        throw err;
    }
  });

const tika = async (tikaJar, opts, location) => {
  const sourcePath = path.resolve(
    __dirname,
    "classpath/org/apache/tika/parser/ocr",
  );
  const propertiesPath = `${sourcePath}/TesseractOCRConfig.properties`;

  await mkdirP(sourcePath);

  fs.writeFileSync(
    propertiesPath,
    `# Tesseract properties
tesseractPath=
language=${opts.language}
pageSegMode=1
maxFileSizeToOcr=2147483647
minFileSizeToOcr=0
timeout=120
#txt or hocr
outputType=txt
preserveInterwordSpacing=false

# properties for image processing
# to enable processing, set enableImageProcessing to 1
enableImageProcessing=0
ImageMagickPath=
density=300
depth=4
colorspace=gray
filter=triangle
resize=900
applyRotation=false
`,
  );

  const classPath = path.resolve(__dirname, "classpath");
  const args = [
    "-cp",
    `${classPath}:${tikaJar}`,
    "org.apache.tika.cli.TikaCLI",
  ];

  return Promise.all([
    runCmd("java", args.concat(["-t", location])),
    runCmd("java", args.concat(["-m", location])),
  ]);
};

export const extract = async (location, opts = {}) => {
  const cfg = Object.assign({language: "eng"}, opts);
  const tikaJar = path.resolve(__dirname, "./tika-app.jar");
  const [text, meta] = await tika(tikaJar, cfg, location);
  return {text, meta};
};

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

const tikaAuthor = maybeGet([
  "Author",
  "creator",
  "og:site_name",
  "article:publisher",
  "twitter:site",
]);
const tikaTitle = maybeGet(["title", "og:title", "twitter:title", "dc:title"]);
const tikaDescription = maybeGet([
  "description",
  "og:description",
  "twitter:description",
]);
const tikaLanguage = maybeGet(["language", "Content-Language", "og:locale"]);
const tikaCreated = meta => {
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

export const tikaMetaFields = meta => ({
  author: tikaAuthor(meta),
  title: tikaTitle(meta),
  description: tikaDescription(meta),
  language: tikaLanguage(meta),
  created: tikaCreated(meta),
});

export default {
  runCmd,
  counter,
  extract,
  tikaMetaFields,
};
