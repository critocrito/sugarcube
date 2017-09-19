import {flow, map, merge, concat, size, get} from 'lodash/fp';
import {envelope as env, data as d, utils} from '@sugarcube/core';
import path from 'path';

import {reverseImageSearchFromFile, entity} from './google';

const {unfold} = utils.fs;
const {reduceP} = utils.combinators;

const querySource = 'glob_pattern';

const plugin = (envelope, {log, cfg}) => {
  const patterns = env.queriesByType(querySource, envelope);
  const headless = !get('google.headless', cfg);

  log.info('Calling the plugin');

  return reduceP((memo, pattern) =>
    unfold(pattern)
      .then(flow([
        map(merge(d.emptyOne())),
        concat(memo),
      ])), [], patterns)
    .tap(files =>
      log.info(`Making a reverse image Google search for ${size(files)} images.`))
    .reduce((memo, file) => {
      const location = path.resolve(file.location);

      log.info(`Searching for ${location}.`);

      return reverseImageSearchFromFile(headless, location)
        .then(flow([
          map(flow([merge(file), entity('google_reverse_image')])),
          concat(memo),
        ]));
    }, [])
    .then(xs => env.concatData(xs, envelope));
};

plugin.desc = 'Make a Google reverse image search.';

plugin.argv = {
};

export default plugin;
