INSERT INTO download (
  unit,
  id_hash,
  type,
  term,
  md5,
  sha256,
  location,
  data
) VALUES (
  ${unit},
  ${idHash},
  ${type},
  ${term},
  ${md5},
  ${sha256},
  ${location},
  ${data}
)
 ON CONFLICT (unit, id_hash) DO UPDATE
SET location = excluded.location,
    data = excluded.data;
