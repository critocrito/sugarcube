import {flow, curry, map, uniq, negate, property} from 'lodash/fp';
import {utils} from '@sugarcube/core';
import db from './db';

const {assertCfg} = utils.assertions;

export const assertDb = curry((envelope, {cfg}) => {
  assertCfg(['mongodb.uri'], cfg);
  db.initialize(cfg.mongodb.uri);
  return envelope;
});

// String -> [{a}] -> [b]
// Given a list of units, return a list of hashes of these units. `hashField`
// is the name of hash field, e.g. `_ls_id_hash`.
const selectByHash = curry((field, data) =>
  flow([map(unit => unit[field]), uniq])(data));

export const idHashes = selectByHash('_sc_id_hash');
export const contentHashes = selectByHash('_sc_content_hash');

export const unitExists = property('_sc_db_exists');
export const unitExistsNot = negate(unitExists);

export default {assertDb, idHashes, contentHashes, unitExists, unitExistsNot};
