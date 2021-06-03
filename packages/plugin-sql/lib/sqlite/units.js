import {get} from "lodash/fp";
// The queries export handles the concatenation of two relations list as well.
import {queries as qs} from "@sugarcube/core";

class Units {
  constructor(db, queries, {queriesStore}) {
    this.db = db;
    this.queries = queries;
    this.queriesStore = queriesStore;
  }

  async create(u) {
    const insertUnit = this.db.transaction((unit) => {
      const {id, existing} = this.selectOrInsertUnitSync(unit);

      const downloads = qs.concat(
        this.listDownloadsSync(id),

        unit._sc_downloads,
      );
      const media = qs.concat(this.listMediaSync(id), unit._sc_media);

      this.createDownloadsSync(downloads, id);
      this.createMediaSync(media, id);
      this.createQueriesSync(unit._sc_queries, id);
      this.createTagsSync(unit._sc_tags, id);
      this.appendToRunSync(unit._sc_markers, id);

      return existing;
    });

    return insertUnit(u);
  }

  async listAll() {
    const {listAllQuery} = this.queries;
    const stmt = this.db.prepare(listAllQuery);

    const units = stmt.all();

    for (let i = 0; i < units.length; i += 1) {
      const {
        id,
        id_hash: idHash,
        id_fields: idFields,
        content_fields: contentFields,
        data: rest,
        ...unit
      } = units[i];

      const downloads = this.listDownloadsSync(id);
      const media = this.listMediaSync(id);
      const queries = this.listQueriesSync(id);
      const tags = this.listTagsSync(id);
      const markers = this.listMarkersSync(id);

      units[i] = {
        _sc_id_hash: idHash,
        _sc_id_fields: JSON.parse(idFields),
        _sc_content_fields: contentFields
          ? JSON.parse(contentFields)
          : undefined,
        _sc_data: JSON.parse(rest),
        _sc_media: media,
        _sc_downloads: downloads,
        _sc_queries: queries,
        _sc_tags: tags,
        _sc_markers: markers,
        // filter null values map names to _sc naming scheme
        ...Object.keys(unit).reduce((memo, key) => {
          const value = units[i][key];
          if (value == null) return memo;
          return {[`_sc_${key}`]: value, ...memo};
        }, {}),
      };
    }

    return units;
  }

  selectOrInsertUnitSync({
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
    _sc_data: rest,
  }) {
    const {showQuery, createQuery} = this.queries;

    const stmt = this.db.prepare(showQuery);
    const stmt2 = this.db.prepare(createQuery);

    const unit = stmt.get({idHash});
    if (unit) return {id: unit.id, existing: true};

    const createdAt = get("source", dates)
      ? get("source", dates).toISOString()
      : undefined;
    const fetchedAt = get("fetch", dates)
      ? get("fetch", dates).toISOString()
      : undefined;

    const {lastInsertRowid} = stmt2.run({
      idHash,
      idFields: JSON.stringify(idFields),
      contentHash,
      contentFields: contentFields ? JSON.stringify(contentFields) : "[]",
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
      data: JSON.stringify(rest),
    });

    return {id: lastInsertRowid, existing: false};
  }

  listQueriesSync(unitId) {
    const {listQueriesQuery} = this.queries;
    const stmt = this.db.prepare(listQueriesQuery);

    return stmt.all({unitId});
  }

  listTagsSync(unitId) {
    const {listTagsQuery} = this.queries;
    const stmt = this.db.prepare(listTagsQuery);

    return stmt.all({unitId});
  }

  listDownloadsSync(unitId) {
    const {listDownloadsQuery} = this.queries;
    return this.listRelationsSync(listDownloadsQuery, unitId);
  }

  listMediaSync(unitId) {
    const {listMediaQuery} = this.queries;
    return this.listRelationsSync(listMediaQuery, unitId);
  }

  listMarkersSync(unitId) {
    const {listMarkersQuery} = this.queries;
    const stmt = this.db.prepare(listMarkersQuery);

    return stmt.all({unitId}).map(({marker}) => marker);
  }

  listRelationsSync(query, unitId) {
    const stmt = this.db.prepare(query);

    const relations = stmt.all({unitId});

    return relations.map(({id_hash: idHash, data: rest, ...relation}) => ({
      _sc_id_hash: idHash,
      ...JSON.parse(rest),
      ...relation,
    }));
  }

  selectOrInsertMarkerSync(marker) {
    const {showMarkerQuery, createMarkerQuery} = this.queries;
    const stmt = this.db.prepare(showMarkerQuery);
    const stmt2 = this.db.prepare(createMarkerQuery);

    const markerId = stmt.get({marker});
    if (markerId != null) return markerId.id;

    const {lastInsertRowid} = stmt2.run({marker});
    return lastInsertRowid;
  }

  createDownloadsSync(downloads, unitId) {
    const {createDownloadsQuery} = this.queries;
    const stmt = this.db.prepare(createDownloadsQuery);

    for (const {
      _sc_id_hash: idHash,
      type,
      term,
      md5,
      sha256,
      location,
      ...rest
    } of downloads) {
      stmt.run({
        idHash,
        type,
        term,
        md5,
        sha256,
        location,
        data: JSON.stringify(rest),
        unit: unitId,
      });
    }
  }

  createMediaSync(media, unitId) {
    const {createMediaQuery} = this.queries;
    const stmt = this.db.prepare(createMediaQuery);

    for (const {_sc_id_hash: idHash, type, term, ...rest} of media) {
      stmt.run({
        idHash,
        type,
        term,
        data: JSON.stringify(rest),
        unit: unitId,
      });
    }
  }

  createQueriesSync(queries, unitId) {
    const {createQueryResultQuery} = this.queries;

    const stmt = this.db.prepare(createQueryResultQuery);

    for (const {type, term} of queries) {
      const query = this.queriesStore.selectOrInsertSync(type, term);

      stmt.run({query, unit: unitId});
    }
  }

  createTagsSync(tags, unitId) {
    const {createTaggedUnitQuery} = this.queries;

    const stmt = this.db.prepare(createTaggedUnitQuery);

    for (const {label} of tags) {
      const queryTag = this.queriesStore.showQueryTagSync(label);

      if (queryTag) stmt.run({queryTag: queryTag.id, unit: unitId});
    }
  }

  appendToRunSync(markers, unitId) {
    const {createRunQuery} = this.queries;
    const stmt = this.db.prepare(createRunQuery);

    for (const marker of markers) {
      const markerId = this.selectOrInsertMarkerSync(marker);
      stmt.run({marker: markerId, unit: unitId});
    }
  }
}

export default Units;
