import unfoldPlugin from "./plugins/unfold";
import mediaTypePlugin from "./plugins/media-type";
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
  fs_unfold: unfoldPlugin,
  fs_media_type: mediaTypePlugin,
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
