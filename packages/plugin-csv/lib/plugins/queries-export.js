import {get, size} from "lodash/fp";
import fs from "fs";
import stringify from "csv-stringify";

const plugin = (envelope, {cfg, log}) => {
  const filename = get("csv.queries_filename", cfg);
  const delimiter = get("csv.delimiter", cfg);

  const {queries} = envelope;

  log.info(
    `Converting ${size(queries)} queries to csv and writing to ${filename}.`
  );

  const csv = stringify({header: true, quotedString: true, delimiter});
  csv.pipe(fs.createWriteStream(filename));

  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    csv.on("error", reject);
    csv.on("finish", () => resolve(envelope));

    queries.forEach(r => csv.write(r));
    csv.end();
  });
};

plugin.desc = "Export queries to a CSV file.";

plugin.argv = {
  "csv.queries_filename": {
    default: "out.csv",
    nargs: 1,
    desc: "The file name to write the CSV to",
  },
};

export default plugin;
