import {flow, curry, pick, values} from "lodash/fp";
import crypto from "crypto";

import {stringify} from "./";

const epoch = d => Math.floor(d / 1000);

export const generateSeed = count => {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    // eslint-disable-next-line no-bitwise
    out.push((((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1));
  }
  return out.join("");
};

export const sha256 = s =>
  crypto
    .createHash("sha256")
    .update(s)
    .digest("hex");

export const sha1 = s =>
  crypto
    .createHash("sha1")
    .update(s)
    .digest("hex");

export const md5 = s =>
  crypto
    .createHash("md5")
    .update(s)
    .digest("hex");

export const hashKeys = curry((keys, u) =>
  flow([pick(keys), values, stringify, sha256])(u)
);

export const hashWithField = curry((field, u) => hashKeys(u[field], u));

// Generate strong uid's.
// - `random` :: If not provided a random seed is created.
// - `d` :: Use this time stamp as counter. If not provided use `Date.now()`.
// Based on: http://antirez.com/news/99
export const uid = (random, d) => {
  const seconds = d ? epoch(d) : epoch(Date.now());
  const seed = sha1(random ? random.toString() : generateSeed(8));
  const counter = sha1(seconds.toString());

  // Make it harder to predict uid's. The uid is a hmac with the seed as
  // secret and the counter as message. Return the hmac as hex.
  const hmac = crypto.createHmac("sha1", seed);
  hmac.update(counter);
  const id = hmac.digest("hex");
  return id;
};

export default {
  generateSeed,
  sha256,
  sha1,
  md5,
  hashKeys,
  hashWithField,
  uid,
};
