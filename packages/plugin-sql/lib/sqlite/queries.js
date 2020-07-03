class Queries {
  constructor(db, queries) {
    this.db = db;
    this.queries = queries;
  }

  selectOrInsertSync(type, term) {
    const {showQuery, createQuery} = this.queries;
    const stmt = this.db.prepare(showQuery);
    const stmt2 = this.db.prepare(createQuery);

    const query = stmt.get({type, term});
    if (query) return query.id;

    const {lastInsertRowid} = stmt2.run({type, term});
    return lastInsertRowid;
  }

  selectOrInsertQueryTagSync(label, description) {
    const {createQueryTagQuery, showQueryTagQuery} = this.queries;
    const stmt = this.db.prepare(showQueryTagQuery);
    const stmt2 = this.db.prepare(createQueryTagQuery);

    const queryTag = stmt.get({label});
    if (queryTag) return queryTag.id;

    const {lastInsertRowid} = stmt2.run({label, description});
    return lastInsertRowid;
  }

  createSync(queries) {
    if (queries.length === 0) return [];

    const {createTaggedQueryQuery} = this.queries;
    const stmt = this.db.prepare(createTaggedQueryQuery);

    const insertQuery = this.db.transaction(({type, term, tags = []}) => {
      const query = this.selectOrInsertSync(type, term);

      if (typeof query !== "number") {
        throw new Error(`${type}/${term} did not yield a row id`);
      }

      for (const {label, description} of tags) {
        const queryTag = this.selectOrInsertQueryTagSync(label, description);
        stmt.run({query, queryTag});
      }
    });

    const errors = [];

    for (const query of queries) {
      try {
        insertQuery(query);
      } catch (e) {
        errors.push({type: query.type, term: query.term, reason: e.message});
      }
    }

    return errors;
  }

  showSync(type, term) {
    const {showQuery} = this.queries;
    const stmt = this.db.prepare(showQuery);
    return stmt.get({type, term});
  }

  async create(queries) {
    return this.createSync(queries);
  }

  async show(type, term) {
    return this.showSync(type, term);
  }

  async listAll() {
    const {listAllQuery, showQueryTagForQueryQuery} = this.queries;
    const stmt = this.db.prepare(listAllQuery);
    const stmt2 = this.db.prepare(showQueryTagForQueryQuery);

    return stmt.all().map(query => {
      const tags = stmt2.all({query: query.id});

      return {...query, tags};
    });
  }

  async listByType(queryType) {
    const {listByTypeQuery, showQueryTagForQueryQuery} = this.queries;
    const stmt = this.db.prepare(listByTypeQuery);
    const stmt2 = this.db.prepare(showQueryTagForQueryQuery);

    return stmt.all({type: queryType}).map(query => {
      const tags = stmt2.all({query: query.id});

      return {...query, tags};
    });
  }
}

export default Queries;
