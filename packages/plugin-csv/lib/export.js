import {curry, flow, size, merge, concat, get,
        keys, uniq, reduce, zip, range, toPairs,
        isPlainObject, isArray, isDate} from 'lodash/fp';
import fs from 'fs';
import Promise from 'bluebird';
import stringify from 'csv-stringify';
import {plugin as p} from 'littlefork-core';

import {assertFilename} from './assertions';

Promise.promisifyAll(fs);

// Prefix keys in a list of pairs with a string and return it as an object,
// e.g.: prefixPairsToObj('xx', [[0, 'a'], [1, 'b']]) => {xx_0: 'a', xx_1; 'b'}
// Prefixing the namespace and turning a list of pairs to an object are handled
// in one pass for performance reasons.
const namespacePairsToObj = curry((ns, pairs) =>
  reduce((memo, [k, v]) =>
    merge(memo, {[`${ns}_${k}`]: v})
  , {}, pairs));

// lodash provides already `toPairs` for objects. This creates pairs of index
// positions and values for arrays, e.g.:
// toAryPairs(['a', 'b']) => [[0, 'a'], [1, 'b']].
const toAryPairs = xs => zip(range(0, size(xs)), xs);

// Create a flat version of a nested unit, e.g.:
// flatten({a: {b: 23, c: {a: 42}}, b: [1, 2], c: 23}) =>
//         {a_b: 23, a_c_a: 42, b_0: 1, b_1: 2, c: 23}
const flatten = unit =>
  reduce((memo, [key, value]) => {
    const iter = flow([namespacePairsToObj(key), flatten]);
    const flattenObj = flow([toPairs, iter]);
    const flattenAry = flow([toAryPairs, iter]);

    switch (value) {
      case (isPlainObject(value) ? value : null): {
        return merge(memo, flattenObj(value));
      }
      case (isArray(value) ? value : null): {
        return merge(memo, flattenAry(value));
      }
      case (isDate(value) ? value : null): {
        return merge(memo, {[key]: value.toISOString()});
      }
      default: {
        return merge(memo, {[key]: value});
      }
    }
  }, {}, toPairs(unit));

// `flattenAndExpand` iterates over the whole input data and creates flat
// objects from nested objects, while collecting all keynames. For performance
// reasons, this happens in one pass.
// flattenAndExpand([{a: 23}, {a: 23, b: {c: 42}}]) =>
//                  [[{a: 23}, {a: 23, b_c: 42}], [a, b_c]]
const flattenAndExpand = reduce(([flatUnits, uniqKeys], unit) => {
  const keyNames = flow([keys, concat(uniqKeys), uniq]);
  const flattenedUnit = flatten(unit);

  return [concat(flatUnits, flattenedUnit), keyNames(flattenedUnit)];
}, [[], []]);

const exportPlugin = (val, {cfg, log}) => {
  const filename = get('csv.filename', cfg);
  const delimiter = get('csv.delimiter', cfg);

  log.info(`Converting to csv and writing to ${filename}.`);
  log.debug(`Converting ${size(val.data)} units to CSV.`);

  const [data, keyNames] = flattenAndExpand(val.data);

  // The template is an object with all possible keys. I use it later to expand
  // objects that miss some keys.
  const template = reduce((memo, k) => merge(memo, {[k]: null}), {}, keyNames);

  // Pipe the csv stream into the file.
  const csv = stringify({header: true, quotedString: true, delimiter});
  csv.pipe(fs.createWriteStream(filename));

  return Promise.fromCallback(cb => {
    csv.on('error', cb);
    csv.on('finish', cb);

    // Avoid lodash forEach to have eager evaluation.
    data.forEach(r => csv.write(merge(template, r)));
    csv.end();
  }).return(val);
};

const plugin = p.liftManyA2([assertFilename, exportPlugin]);

plugin.desc = 'Export data units to a file in CSV format.';
plugin.argv = {
  'csv.filename': {
    default: 'out.csv',
    nargs: 1,
    desc: 'The file name to write the CSV to',
  },
};

export default plugin;
