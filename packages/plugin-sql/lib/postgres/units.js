import {get} from "lodash/fp";
// The queries export handles the concatenation of two relations list as well.
import {queries as qs} from "@sugarcube/core";

class Units {
  constructor(db, pgp, queries, {queriesStore}) {
    this.db = db;
    this.pgp = pgp;
    this.queries = queries;
    this.queriesStore = queriesStore;
  }

  async create(unit) {
    return this.db.tx(async t => {
      const {id, existing} = await this.selectOrInsertUnit(unit, t);
      const downloads = qs.concat(
        await this.listDownloads(id, t),
        unit._sc_downloads,
      );
      const media = qs.concat(await this.listMedia(id, t), unit._sc_media);

      await this.createDownloads(downloads, id, t);
      await this.createMedia(media, id, t);
      await this.createQueries(unit._sc_queries, id, t);
      await this.appendToRun(unit._sc_markers, id, t);

      return existing;
    });
  }

  async listAll() {
    const {listAllUnits} = this.queries;
    const units = await this.db.manyOrNone(listAllUnits);
    if (units == null) return [];

    return Promise.all(
      units.map(
        async ({
          id,
          id_hash: idHash,
          id_fields: idFields,
          content_fields: contentFields,
          data,
          ...unit
        }) => {
          const downloads = await this.listDownloads(id, this.db);
          const media = await this.listMedia(id, this.db);
          const queries = await this.listQueries(id, this.db);
          const markers = await this.listMarkers(id, this.db);

          return {
            _sc_id_hash: idHash,
            _sc_id_fields: idFields,
            _sc_content_fields: contentFields,
            _sc_data: data,
            _sc_media: media,
            _sc_downloads: downloads,
            _sc_queries: queries,
            _sc_markers: markers,
            // filter null values map names to _sc naming scheme
            ...Object.keys(unit).reduce((memo, key) => {
              const value = unit[key];
              if (value == null) return memo;
              return {[`_sc_${key}`]: value, ...memo};
            }, {}),
          };
        },
      ),
    );
  }

  async selectOrInsertUnit(
    {
      _sc_id_hash: idHash,
      _sc_id_fields: idFields,
      _sc_content_hash: contentHash,
      _sc_content_fields: contentFields,
      _sc_source: source,
      _sc_unit_id: unitId,
      _sc_body: body,
      _sc_href: href,
      _sc_author: author,
      _sc_title: title,
      _sc_description: description,
      _sc_language: language,
      _sc_pubdates: dates,
      _sc_data: data,
    },
    t,
  ) {
    const {showQuery, createQuery} = this.queries;

    const unit = await t.oneOrNone(showQuery, {idHash}, q => q && q.id);
    if (unit != null) return {id: unit, existing: true};

    const createdAt = get("source", dates)
      ? get("source", dates).toISOString()
      : undefined;
    const fetchedAt = get("fetch", dates)
      ? get("fetch", dates).toISOString()
      : undefined;

    const {id} = await t.one(createQuery, {
      idHash,
      idFields,
      contentHash,
      contentFields,
      source,
      unitId,
      body,
      href,
      author,
      title,
      description,
      language,
      createdAt,
      fetchedAt,
      data,
    });

    return {id, existing: false};
  }

  async selectOrInsertMarker(marker, t) {
    const {showMarkerQuery, createMarkerQuery} = this.queries;

    const markerId = await t.oneOrNone(
      showMarkerQuery,
      {marker},
      q => q && q.id,
    );
    return markerId || t.one(createMarkerQuery, {marker}, q => q && q.id);
  }

  listDownloads(unitId, t) {
    const {listDownloadsQuery} = this.queries;
    return this.listRelations(listDownloadsQuery, unitId, t);
  }

  listMedia(unitId, t) {
    const {listMediaQuery} = this.queries;
    return this.listRelations(listMediaQuery, unitId, t);
  }

  async createDownloads(downloads, unitId, t) {
    const {createDownloadsQuery} = this.queries;

    await Promise.all(
      downloads.map(
        ({_sc_id_hash: idHash, type, term, md5, sha256, location, ...data}) =>
          t.none(createDownloadsQuery, {
            idHash,
            type,
            term,
            md5,
            sha256,
            location,
            data,
            unit: unitId,
          }),
      ),
    );
  }

  async createMedia(media, unitId, t) {
    const {createMediaQuery} = this.queries;

    await Promise.all(
      media.map(({_sc_id_hash: idHash, type, term, ...data}) =>
        t.none(createMediaQuery, {
          idHash,
          type,
          term,
          data,
          unit: unitId,
        }),
      ),
    );
  }

  async createQueries(queries, unitId, t) {
    const {createQueryResultQuery} = this.queries;

    await Promise.all(
      queries.map(async ({type, term}) => {
        const query = await this.queriesStore.selectOrInsert(type, term, t);
        t.none(createQueryResultQuery, {query, unit: unitId});
      }),
    );
  }

  async appendToRun(markers, unitId, t) {
    const {createRunQuery} = this.queries;

    await Promise.all(
      markers.map(async marker => {
        const markerId = await this.selectOrInsertMarker(marker, t);
        await t.none(createRunQuery, {marker: markerId, unit: unitId});
      }),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  async listRelations(query, unitId, t) {
    const relations = await t.manyOrNone(query, {unitId});

    return relations.map(({id_hash: idHash, data, ...relation}) => {
      return {
        _sc_id_hash: idHash,
        ...data,
        ...relation,
      };
    });
  }
}

export default Units;
