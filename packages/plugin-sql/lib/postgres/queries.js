class Queries {
  constructor(db, pgp, queries) {
    this.db = db;
    this.pgp = pgp;
    this.queries = queries;
  }

  async create(queries) {
    if (queries.length === 0) return [];

    const {showQuery, createQuery, createQueryTagQuery} = this.queries;

    const selectOrInsertQuery = async (type, term, t) => {
      const id = await t.oneOrNone(showQuery, {type, term}, q => q && q.id);
      return id || t.one(createQuery, {type, term}, q => q.id);
    };

    const insertQuery = async ({type, term, tags}, t) => {
      const id = await selectOrInsertQuery(type, term, t);

      if (tags.length === 0) return;

      const cs = new this.pgp.helpers.ColumnSet(["query", "name", "value"]);
      const values = this.pgp.helpers.values(
        tags.map(({name, value}) => ({
          name,
          value,
          query: id,
        })),
        cs,
      );

      await t.none(createQueryTagQuery, {values});
    };

    const errors = [];

    await Promise.all(
      queries.map(async query => {
        try {
          await this.db.tx(async t => {
            await insertQuery(query, t);
          });
        } catch (e) {
          errors.push({
            type: query.type,
            term: query.term,
            reason: e.message,
          });
        }
      }),
    );

    return errors;
  }

  async listAll() {
    const {listAllQuery, showQueryTagQuery} = this.queries;
    const queries = await this.db.manyOrNone(listAllQuery);
    if (queries == null) return [];

    return Promise.all(
      queries.map(async query => {
        const tags = await this.db.manyOrNone(showQueryTagQuery, {
          query: query.id,
        });

        return {...query, tags};
      }),
    );
  }

  async listByType(queryType) {
    const {listByTypeQuery, showQueryTagQuery} = this.queries;
    const queries = await this.db.manyOrNone(listByTypeQuery, {
      type: queryType,
    });
    if (queries == null) return [];

    return Promise.all(
      queries.map(async query => {
        const tags = await this.db.manyOrNone(showQueryTagQuery, {
          query: query.id,
        });

        return {...query, tags};
      }),
    );
  }
}

export default Queries;
