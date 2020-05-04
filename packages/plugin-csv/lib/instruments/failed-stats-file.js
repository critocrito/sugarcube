import {get} from "lodash/fp";
import fs from "fs";
import path from "path";
import stringify from "csv-stringify";

const instrument = cfg => {
  const dataDir = get("csv.data_dir", cfg);
  const delimiter = get("csv.delimiter", cfg);
  const label = get("csv.label", cfg);
  const appendMode = get("csv.append", cfg);

  const columns = ["type", "term", "reason", "plugin"];

  let file = filename => {
    if (filename == null) return null;
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
    const flags = appendMode ? "a" : "w";

    let writeStream;

    if (appendMode) {
      try {
        fs.accessSync(filename);
        writeStream = fs.createWriteStream(filename, {flags});
      } catch (err) {
        writeStream = fs.createWriteStream(filename, {flags});
        writeStream.write(`${columns.join(delimiter)}\n`);
      }
    } else {
      writeStream = fs.createWriteStream(filename, {flags});
      writeStream.write(`${columns.join(delimiter)}\n`);
    }

    // Memoize the write stream;
    file = () => writeStream;

    return file();
  };

  let csvWriter = filename => {
    if (filename == null) return null;
    const writeStream = file(filename);
    const csv = stringify({header: false, columns, delimiter});
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

      if (writer != null) writer.write({type, term, reason, plugin});
    },

    end: () => {
      const fileHandler = file();
      const writer = csvWriter();
      if (fileHandler != null) fileHandler.end();
      if (writer != null) writer.end();
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
  "csv.append": {
    type: "boolean",
    default: false,
    desc: "Append to a CSV file rather than overwrite.",
  },
};

export default instrument;
