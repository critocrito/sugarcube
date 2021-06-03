class Queries {
  constructor(db, pgp, queries) {
    this.db = db;
    this.pgp = pgp;
    this.queries = queries;
  }

  async create(queries) {
    if (queries.length === 0) return [];

    const {createTaggedQueryQuery} = this.queries;

    const insertQuery = async ({type, term, tags}, t) => {
      const query = await this.selectOrInsert(type, term, t);

      if (tags.length === 0) return;

      for (const {label, description} of tags) {
        // eslint-disable-next-line no-await-in-loop
        const queryTag = await this.selectOrInsertQueryTag(
          label,
          description,
          t,
        );
        // eslint-disable-next-line no-await-in-loop
        await t.none(createTaggedQueryQuery, {query, queryTag});
      }
    };

    const errors = [];

    await Promise.all(
      queries.map(async (query) => {
        try {
          await this.db.tx(async (t) => {
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

  async selectOrInsert(type, term, t) {
    const {showQuery, createQuery} = this.queries;
    const id = await t.oneOrNone(showQuery, {type, term}, (q) => q && q.id);
    return id || t.one(createQuery, {type, term}, (q) => q.id);
  }

  async showQueryTag(label, t) {
    const {showQueryTagQuery} = this.queries;
    const queryTag = await t.oneOrNone(showQueryTagQuery, {label}, (q) => q);
    if (queryTag) return queryTag;
    return undefined;
  }

  async selectOrInsertQueryTag(label, description, t) {
    const {createQueryTagQuery} = this.queries;
    const queryTag = await this.showQueryTag(label, t);
    if (queryTag) return queryTag.id;
    return t.one(createQueryTagQuery, {label, description}, (q) => q.id);
  }

  async listAll() {
    const {listAllQuery, showQueryTagForQueryQuery} = this.queries;
    const queries = await this.db.manyOrNone(listAllQuery);
    if (queries == null) return [];

    return Promise.all(
      queries.map(async (query) => {
        const tags = await this.db.manyOrNone(showQueryTagForQueryQuery, {
          query: query.id,
        });

        return {...query, tags};
      }),
    );
  }

  async listByType(queryType) {
    const {listByTypeQuery, showQueryTagForQueryQuery} = this.queries;
    const queries = await this.db.manyOrNone(listByTypeQuery, {
      type: queryType,
    });
    if (queries == null) return [];

    return Promise.all(
      queries.map(async (query) => {
        const tags = await this.db.manyOrNone(showQueryTagForQueryQuery, {
          query: query.id,
        });

        return {...query, tags};
      }),
    );
  }
}

export default Queries;
