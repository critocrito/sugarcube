import {getOr, take, get} from "lodash/fp";
import path from "path";
import fs from "fs";

const writef = async (envelope, {cfg}) => {
  const chunkSize = get("tap.chunk_size", cfg);
  const limit = getOr(null, "tap.limit", cfg);
  const target = getOr(`data-${cfg.marker}.json`, "tap.filename", cfg);

  const writes = [];

  if (chunkSize != null) {
    const dirname = path.dirname(target);
    const extname = path.extname(target);
    const basename = path.basename(target, extname);

    for (let i = 0; i < envelope.data.length; i += chunkSize) {
      const filename = path.join(dirname, `${basename}-${i}${extname}`);

      const data = envelope.data.slice(i, i + chunkSize);
      const text = JSON.stringify(limit ? take(limit, data) : data);

      writes.push(fs.promises.writeFile(filename, text));
    }
  } else {
    const text = JSON.stringify(
      limit ? take(limit, envelope.data) : envelope.data,
    );
    writes.push(fs.promises.writeFile(target, text));
  }

  await Promise.all(writes);

  return envelope;
};

writef.desc = "Write the envelope data to a file.";

writef.argv = {
  "tap.filename": {
    type: "string",
    nargs: 1,
    desc:
      "Specify the name of the output file. Defaults to data-<marker>.json.",
  },
  "tap.chunk_size": {
    type: "number",
    nargs: 1,
    desc: "Split the data into chunks and write it to multiple files.",
  },
};

export default writef;
