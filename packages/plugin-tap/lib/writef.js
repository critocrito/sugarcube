import {getOr, take} from "lodash/fp";
import pify from "pify";
import fs from "fs";

const writeFileAsync = pify(fs.writeFile);

const writef = (envelope, {cfg}) => {
  const {data} = envelope;
  const {marker} = cfg;
  const limit = getOr(null, "tap.limit", cfg);
  const target = getOr(`data-${marker}.json`, "tap.filename", cfg);
  const text = JSON.stringify(limit ? take(limit, data) : data);

  return writeFileAsync(target, text).then(() => envelope);
};

writef.desc = "Write the envelope data to a file.";

writef.argv = {
  "tap.filename": {
    type: "string",
    nargs: 1,
    desc:
      "Specify the name of the output file. Defaults to data-<marker>.json.",
  },
};

export default writef;
