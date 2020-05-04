import importPlugin from "./plugins/import";
import fromJsonPlugin from "./plugins/from-json";
import {
  unfold,
  mkdirP,
  sha256sum,
  md5sum,
  cpP,
  existsP,
  accessP,
  unlinkP,
} from "./api";

export const plugins = {
  fs_import: importPlugin,
  fs_from_json: fromJsonPlugin,
};

export * from "./api";
export default {
  plugins,
  unfold,
  mkdirP,
  sha256sum,
  md5sum,
  cpP,
  existsP,
  accessP,
  unlinkP,
};
