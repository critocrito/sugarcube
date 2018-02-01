import exifPlugin from "./plugins/exif";
import youtubedlPlugin from "./plugins/youtubedl";

const plugins = {
  media_exif: exifPlugin,
  media_youtubedl: youtubedlPlugin,
};

export {plugins};
export default {plugins};
