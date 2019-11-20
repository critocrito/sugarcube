import {pick} from "lodash/fp";

class Queries {
  constructor(db, queries) {
    this.db = db;
    this.queries = queries;
  }

  async create(queries, queryFields = []) {
    if (queries.length === 0) return;
    const {createQuery} = this.queries;
    const stmt = this.db.prepare(createQuery);
    this.db.transaction(qs => {
      // eslint-disable-next-line no-restricted-syntax
      for (const {type, term, ...data} of qs)
        stmt.run({
          type,
          term,
          data:
            queryFields.length === 0
              ? JSON.stringify(data)
              : JSON.stringify(pick(queryFields, data)),
        });
    })(queries);
  }

  async listAll(queryFields = []) {
    const {listAllQuery} = this.queries;
    const stmt = this.db.prepare(listAllQuery);
    return stmt.all().map(({type, term, data}) => {
      return {
        type,
        term,
        ...(queryFields.length === 0
          ? JSON.parse(data)
          : pick(queryFields, JSON.parse(data))),
      };
    });
  }

  async listByType(queryType, queryFields = []) {
    const {listByTypeQuery} = this.queries;
    const stmt = this.db.prepare(listByTypeQuery);
    return stmt.all({type: queryType}).map(({type, term, data}) => {
      return {
        type,
        term,
        ...(queryFields.length === 0
          ? JSON.parse(data)
          : pick(queryFields, JSON.parse(data))),
      };
    });
  }
}

export default Queries;
