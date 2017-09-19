import {getOr, take} from "lodash/fp";
import Promise from "bluebird";
import fs from "fs";

Promise.promisifyAll(fs);

const writef = (envelope, {cfg}) => {
  const {data} = envelope;
  const {marker} = cfg;
  const limit = getOr(null, "tap.limit", cfg);
  const target = getOr(`data-${marker}.json`, "tap.filename", cfg);

  return fs
    .writeFileAsync(target, JSON.stringify(limit ? take(limit, data) : data))
    .return(envelope);
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
