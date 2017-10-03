import {
  flow,
  reduce,
  map,
  forEach,
  filter,
  flatten,
  first,
  pick,
  omit,
  keys,
  merge,
  concat,
  property,
  includes,
  isEmpty,
} from "lodash/fp";
import Promise from "bluebird";
import mongodb from "mongodb";
import {data as d, utils} from "@sugarcube/core";

Promise.promisifyAll(mongodb);

const {mapP, flowP} = utils.combinators;

let connectionUri;

const unitsC = "units";
const relationsC = "relations";
const revisionsC = "revisions";

// String -> Future DbHandler
// Given a MongoDB URI string return a db handler for that MongoDB.
// Use the bluebird dispose pattern with `using`.
const connection = () =>
  mongodb.MongoClient.connectAsync(connectionUri).disposer(db => db.close());

const findMany = (coll, query = {}, projection = {}) =>
  Promise.using(connection(), db =>
    db
      .collection(coll)
      .find(query, projection)
      .toArray()
  );

const findOne = (coll, query) =>
  Promise.using(connection(), db =>
    db
      .collection(coll)
      .find(query)
      .limit(1)
      .next()
  );

const insertMany = (coll, docs) =>
  Promise.using(connection(), db =>
    db
      .collection(coll)
      .insertMany(docs)
      .then(({ops}) => ops)
  );

const insertOne = (coll, doc) =>
  Promise.using(connection(), db =>
    db
      .collection(coll)
      .insertOne(doc)
      .then(({ops}) => first(ops))
  );

const updateOne = (coll, query, update) =>
  Promise.using(connection(), db =>
    db.collection(coll).updateOne(query, update)
  );

const upsertOne = (coll, query, update) =>
  Promise.using(connection(), db =>
    db.collection(coll).updateOne(query, update, {upsert: true})
  );

const removeOne = (coll, selector) =>
  Promise.using(connection(), db => db.collection(coll).removeOne(selector));

const orderedBulkUpdatesOne = (coll, query, updates) =>
  Promise.using(connection(), db => {
    const bulk = db.collection(coll).initializeOrderedBulkOp();
    forEach(u => bulk.find(query).updateOne(u), updates);
    return bulk.execute();
  });

const aggregate = (coll, query) =>
  Promise.using(connection(), db => db.collection(coll).aggregateAsync(query));

// Collection -> [String] -> [String]
const matchUnits = ids => {
  const query = [
    {$match: {_sc_id_hash: {$in: ids}}},
    {$group: {_id: null, existing: {$addToSet: "$_sc_id_hash"}}},
    {$project: {existing: 1, new: {$literal: ids}}},
    {$project: {hashes: {$setIntersection: ["$new", "$existing"]}}},
  ];

  return aggregate(unitsC, query).then(results => {
    // It's a weirdness of the mongodb driver, if the pipeline got no match,
    // it simply returns an empty array.
    if (isEmpty(results)) {
      return Promise.resolve([]);
    }
    return first(results).hashes;
  });
};

// {a} -> [a]
// Takes an object that has _sc_id_hash as key, and _sc_content_hash as value.
const matchRevisions = ids => {
  const query = {_sc_id_hash: {$in: keys(ids)}};
  const projection = {_id: false, _sc_id_hash: 1, _sc_content_hash: 1};

  return findMany(unitsC, query, projection).then(
    reduce((memo, r) => {
      if (ids[r._sc_id_hash] !== r._sc_content_hash) {
        // We have a revisions.
        return concat(memo, [r._sc_id_hash]);
      }
      return memo;
    }, [])
  );
};

// Collection -> [{a}] -> Future [{a}]
// Store a list of units to the collection. Returns a promise that resolves
// to the list of units including the new unit object id.
const storeData = ({data}) => {
  if (isEmpty(data)) {
    return Promise.resolve(data);
  }
  return insertMany(unitsC, map(omit(["_sc_db_exists"]), data));
};

const storeRelation = r => {
  const query = {_sc_id_hash: r._sc_id_hash};
  const update = {
    $set: pick(["_sc_id_hash", "type", "term"], r),
    $addToSet: {units: r.unit},
  };
  return upsertOne(relationsC, query, update);
};

// [{a}] -> Future [{a}]
// Store all new relations of a list of units to a collection. Returns a promise
// that resolves to a list of relations that have been stored.
const storeRelations = flow([
  property("data"),
  map(u => map(merge({unit: u._sc_id_hash}), u._sc_relations)),
  flatten,
  map(pick(["unit", "type", "term", "_sc_id_hash"])),
  mapP(storeRelation),
]);

const storeRevision = r => {
  const query = {unit: r._sc_id_hash};
  const update = {
    $set: {unit: r._sc_id_hash},
    $push: {revisions: r},
  };
  return upsertOne(revisionsC, query, update);
};

const storeRevisions = ({data}) => {
  const hashes = reduce(
    (memo, u) => merge(memo, {[u._sc_id_hash]: u._sc_content_hash}),
    {},
    data
  );

  return matchRevisions(hashes).then(results => {
    const revs = filter(u => includes(u._sc_id_hash, results), data);
    return mapP(storeRevision, revs);
  });
};

const fetchUnit = id => findOne(unitsC, {_sc_id_hash: id}, {_id: 0});

const fetchData = ids => findMany(unitsC, {_sc_id_hash: {$in: ids}}, {_id: 0});

const fetchRelations = ids =>
  findMany(relationsC, {_sc_id_hash: {$in: ids}}, {_id: 0});

const fetchRevisions = ids =>
  findMany(revisionsC, {unit: {$in: ids}}, {_id: 0});

const updateUnit = unit => {
  const {_sc_id_hash} = unit;
  return flowP([
    fetchUnit,
    u => updateOne(unitsC, {_sc_id_hash}, d.concatOne(u, unit)),
    () => fetchUnit(_sc_id_hash),
  ])(_sc_id_hash);
};

const updateData = flow([property("data"), mapP(updateUnit)]);
const complementData = flow([property("data"), map("_sc_id_hash"), fetchData]);

export default {
  unitsC,
  relationsC,
  revisionsC,

  initialize: uri => {
    connectionUri = uri;
    return this;
  },

  findMany,
  findOne,
  insertMany,
  insertOne,
  updateOne,
  upsertOne,
  removeOne,
  orderedBulkUpdatesOne,
  aggregate,
  matchUnits,
  matchRevisions,
  storeData,
  storeRelation,
  storeRelations,
  storeRevision,
  storeRevisions,
  fetchUnit,
  fetchData,
  fetchRelations,
  fetchRevisions,
  updateUnit,
  updateData,
  complementData,
};
