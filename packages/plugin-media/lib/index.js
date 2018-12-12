import exifPlugin from "./plugins/exif";
import youtubedlPlugin from "./plugins/youtubedl";
import youtubedlCheckPlugin from "./plugins/youtubedl-check";

const plugins = {
  media_exif: exifPlugin,
  media_youtubedl: youtubedlPlugin,
  media_youtubedl_check: youtubedlCheckPlugin,
};

export {plugins};
export default {plugins};
