import {get} from "lodash/fp";
import readChunk from "read-chunk";
import fileType from "file-type";
import {envelope as env} from "@sugarcube/core";

const mimeCategory = mimeType => {
  if (["video", "image"].includes(mimeType.replace(/^(\w*)\/.*/g, "$1"))) {
    return mimeType.replace(/^(\w*)\/.*/g, "$1");
  }
  if (mimeType === "application/pdf") return "pdf";
  return null;
};

const plugin = (envelope, {cfg, log, stats}) => {
  const locationField = get("fs.location_field", cfg);

  return env.fmapData(unit => {
    const location = unit[locationField];

    if (location == null) {
      log.warn(`Unit ${unit._sc_id_hash} has no file location. Skipping.`);
      return unit;
    }

    // Determine the mime-type of the file.
    const buffer = readChunk.sync(location, 0, fileType.minimumBytes);
    const {mime} = fileType(buffer);
    const category = mimeCategory(mime);
    const media = [];

    log.debug(`${location} determined to have a mime type of: ${mime}`);

    if (["video", "image", "pdf"].includes(category)) {
      media.push({type: category, term: location});
    } else {
      stats.fail({
        type: unit._sc_source,
        term: location,
        plugin: "fs_media_type",
        reason: `Unsupported category for mime type: ${mime}`,
      });
    }

    return Object.assign(unit, {_sc_media: unit._sc_media.concat(media)});
  }, envelope);
};

plugin.desc = "Populate the media directory from file locations.";

plugin.argv = {
  "fs.location_field": {
    type: "string",
    default: "location",
    nargs: 1,
    desc: "Name the field that contains the path to the file.",
  },
};

export default plugin;
