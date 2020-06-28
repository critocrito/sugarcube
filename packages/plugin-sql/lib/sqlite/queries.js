class Queries {
  constructor(db, queries) {
    this.db = db;
    this.queries = queries;
  }

  async create(queries) {
    if (queries.length === 0) return [];

    const {showQuery, createQuery, createQueryTagQuery} = this.queries;
    const stmt = this.db.prepare(showQuery);
    const stmt2 = this.db.prepare(createQuery);
    const stmt3 = this.db.prepare(createQueryTagQuery);

    const selectOrInsertQuery = (type, term) => {
      const {id} = stmt.get({type, term});
      if (id) return id;

      const {lastInsertRowid} = stmt2.run({type, term});
      return lastInsertRowid;
    };

    const insertQuery = this.db.transaction(({type, term, tags}) => {
      const query = selectOrInsertQuery(type, term);

      if (typeof query !== "number") {
        throw new Error(`${type}/${term} did not yield a row id`);
      }

      for (const {name, value} of tags) {
        stmt3.run({query, name, value});
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

  async listAll() {
    const {listAllQuery, showQueryTagQuery} = this.queries;
    const stmt = this.db.prepare(listAllQuery);
    const stmt2 = this.db.prepare(showQueryTagQuery);

    return stmt.all().map(query => {
      const tags = stmt2.all({query: query.id});

      return {...query, tags};
    });
  }

  async listByType(queryType) {
    const {listByTypeQuery, showQueryTagQuery} = this.queries;
    const stmt = this.db.prepare(listByTypeQuery);
    const stmt2 = this.db.prepare(showQueryTagQuery);

    return stmt.all({type: queryType}).map(query => {
      const tags = stmt2.all({query: query.id});

      return {...query, tags};
    });
  }
}

export default Queries;
