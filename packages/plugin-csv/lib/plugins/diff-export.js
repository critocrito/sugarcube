import {get, getOr} from "lodash/fp";
import fs from "fs";
import path from "path";
import stringify from "csv-stringify";
import {mkdirP} from "@sugarcube/plugin-fs";

const plugin = (envelope, {cfg, log, stats}) => {
  const delimiter = get("csv.delimiter", cfg);
  const marker = get("marker", cfg);
  const dataDir = get("csv.data_dir", cfg);

  return mkdirP(dataDir)
    .then(() => {
      const diffStats = Object.keys(stats.get("diff"))
        .map(key => [key, getOr([], "units", stats.get("diff")[key])])
        .filter(([, units]) => units.length > 0);

      if (diffStats.length === 0) return;

      const destDir = path.resolve(dataDir, marker);

      // eslint-disable-next-line promise/no-nesting, consistent-return
      return mkdirP(destDir).then(() =>
        Promise.all(
          diffStats.map(([key, units]) => {
            const filename = path.resolve(destDir, `${key}.csv`);
            const csv = stringify({
              header: true,
              quotedString: true,
              delimiter,
            });

            log.debug(`Writing ${key} stats to ${filename}.`);

            // Pipe the csv stream into the file.
            csv.pipe(fs.createWriteStream(filename));

            // eslint-disable-next-line promise/avoid-new
            return new Promise((resolve, reject) => {
              csv.on("error", reject);
              csv.on("finish", () => resolve(envelope));
              units.forEach(r => csv.write(r));
              csv.end();
            });
          }),
        ),
      );
    })
    .then(() => envelope);
};

plugin.desc = "Export the diff stats as CSV files.";

plugin.argv = {
  "csv.data_dir": {
    type: "string",
    nargs: 1,
    default: "./data/diff_stats",
    desc: "Export the diff stats as CSV files.",
  },
};

export default plugin;
