import exifPlugin from "./plugins/exif";
import youtubedlPlugin from "./plugins/youtubedl";
import youtubedlCheckPlugin from "./plugins/youtubedl-check";
import mosaicPlugin from "./plugins/mosaic";

const plugins = {
  media_exif: exifPlugin,
  media_youtubedl: youtubedlPlugin,
  media_youtubedl_check: youtubedlCheckPlugin,
  media_mosaic: mosaicPlugin,
};

export {plugins};
export default {plugins};
