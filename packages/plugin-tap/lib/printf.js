/* eslint-disable no-console */
import {getOr, take} from 'lodash/fp';
import {inspect} from 'util';

const printf = (envelope, {cfg}) => {
  const {data, queries} = envelope;
  const limit = getOr(null, 'tap.limit', cfg);
  const opts = {colors: true, depth: null, maxArrayLength: null};

  console.log('Data:');
  console.log(inspect(limit ? take(limit, data) : data, opts));
  console.log('\nQueries:');
  console.log(inspect(queries, opts));
  console.log('\nConfig:');
  console.log(inspect(cfg, opts));

  return envelope;
};

printf.desc = 'Print the envelope to the screen.';

export default printf;
