import {flow, curry, pick, values} from "lodash/fp";
import crypto from "crypto";

import {stringify} from "./";

export const sha256 = s =>
  crypto
    .createHash("sha256")
    .update(s)
    .digest("hex");

export const hashKeys = curry((keys, u) =>
  flow([pick(keys), values, stringify, sha256])(u)
);

export const hashWithField = curry((field, u) => hashKeys(u[field], u));

export default {
  sha256,
  hashKeys,
  hashWithField,
};
