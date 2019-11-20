import {pick} from "lodash/fp";

class Queries {
  constructor(db, pgp, queries) {
    this.db = db;
    this.pgp = pgp;
    this.queries = queries;
  }

  async create(queries, queryFields = []) {
    if (queries.length === 0) return;
    const {createQuery} = this.queries;
    const cs = new this.pgp.helpers.ColumnSet(["type", "term", "data"]);
    const values = this.pgp.helpers.values(
      queries.map(({type, term, ...data}) => ({
        type,
        term,
        data: queryFields.length === 0 ? data : pick(queryFields, data),
      })),
      cs,
    );
    await this.db.none(createQuery, {values});
  }

  async listAll(queryFields = []) {
    const {listAllQuery} = this.queries;
    const queries = await this.db.manyOrNone(listAllQuery);
    if (queries == null) return [];
    return queries.map(({type, term, data}) => ({
      type,
      term,
      ...(queryFields.length === 0 ? data : pick(queryFields, data)),
    }));
  }

  async listByType(queryType, queryFields = []) {
    const {listByTypeQuery} = this.queries;
    const queries = await this.db.manyOrNone(listByTypeQuery, {
      type: queryType,
    });
    if (queries == null) return [];
    return queries.map(({type, term, data}) => ({
      type,
      term,
      ...(queryFields.length === 0 ? data : pick(queryFields, data)),
    }));
  }
}

export default Queries;
