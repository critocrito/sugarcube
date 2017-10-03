import {curry, concat, merge} from "lodash/fp";
import {fold as foldP} from "combinators-p";
import csvParse from "csv-parse";
import fs from "fs";

export const parse = curry((delimiter, unit) => {
  const records = [];
  const parser = csvParse({delimiter, columns: true});
  const input = fs.createReadStream(unit.location);

  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    parser.on("error", reject);
    parser.on("finish", () => resolve(records));
    parser.on("readable", () => {
      let record;
      // eslint-disable-next-line no-cond-assign
      while ((record = parser.read())) {
        records.push(merge(unit, record));
      }
    });
    input.pipe(parser);
  });
});

export const parseMany = curry((delimiter, units) =>
  foldP((memo, unit) => parse(delimiter, unit).then(concat(memo)), [], units)
);

export default {parse, parseMany};
