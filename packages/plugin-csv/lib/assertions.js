import {utils} from 'littlefork-core';

const {assertCfg} = utils.assertions;

export const assertFilename = assertCfg(['csv.filename']);

export const assertIdFields = assertCfg([
  'csv.id_fields',
]);

export default {
  assertFilename,
  assertIdFields,
};
