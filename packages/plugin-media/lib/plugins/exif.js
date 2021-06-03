import {reduce, merge} from "lodash/fp";
import request from "request";
import gm from "gm";
import {envelope as env} from "@sugarcube/core";

const reduceObj = reduce.convert({cap: false});

const exif = (href) => {
  const r = request(href);
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    r.on("error", reject);
    r.on("response", (res) =>
      gm(res).identify((err, data) => {
        if (err) return resolve({});
        return resolve(data);
      }),
    );
  });
};

// MongoDB doesn't like dots in keys.
const normalizeKeys = reduceObj((memo, v, k) => {
  const key = k.split(".").join("_");
  return merge(memo, {[key]: v});
}, {});

const queryExif = (envelope) =>
  env.fmapDataMediaAsync((m) => {
    const {type, term} = m;
    if (type !== "image") {
      return m;
    }
    return exif(term).then((data) => merge(m, {exif: normalizeKeys(data)}));
  }, envelope);

const plugin = queryExif;

plugin.desc = "Extract EXIF data from images.";

export default plugin;
