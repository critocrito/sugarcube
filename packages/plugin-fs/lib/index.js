import importPlugin from "./plugins/import";
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
