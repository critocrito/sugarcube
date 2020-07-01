SELECT id,
       id_hash,
       id_fields,
       content_hash,
       content_fields,
       source,
       unit_id,
       body,
       href,
       author,
       title,
       description,
       language,
       created_at,
       fetched_at,
       data
  FROM unit
 WHERE id_hash = $idHash;
