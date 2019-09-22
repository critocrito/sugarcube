import {get} from "lodash/fp";
import fs from "fs";
import path from "path";
import stringify from "csv-stringify";

const instrument = cfg => {
  const dataDir = get("csv.data_dir", cfg);
  const delimiter = get("csv.delimiter", cfg);
  const label = get("csv.label", cfg);

  let file = filename => {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
    const writeStream = fs.createWriteStream(filename);

    // Memoize the write stream;
    file = () => writeStream;

    return file();
  };

  let csvWriter = filename => {
    const writeStream = file(filename);
    const csv = stringify({header: true, delimiter});
    csv.pipe(writeStream);

    // Memoize the CSV writer.
    csvWriter = () => csv;
    return csvWriter();
  };

  return {
    fail: ({type, term, marker, reason, plugin}) => {
      // The filename construction is shared with the mail_failed_stats and
      // the csv_export_failed plugin. If updated here, update there as well.
      const filename = path.join(
        dataDir,
        `failed-stats-${label == null ? "" : `${label}-`}${marker}.csv`,
      );
      const writer = csvWriter(filename);

      writer.write({type, term, reason, plugin});
    },

    end: () => {
      file().end();
      csvWriter().end();
    },
  };
};

instrument.desc = "Write failures to a CSV file [fail, end].";
instrument.argv = {
  "csv.data_dir": {
    type: "string",
    default: "./data",
    nargs: 1,
    desc: "Store the CSV file in this directory.",
  },
  "csv.label": {
    type: "string",
    nargs: 1,
    desc: "Add a label to the export file name.",
  },
};

export default instrument;
