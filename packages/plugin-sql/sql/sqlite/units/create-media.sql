INSERT INTO media (
  unit,
  id_hash,
  type,
  term,
  data
) VALUES (
  $unit,
  $idHash,
  $type,
  $term,
  $data
)
 ON CONFLICT (unit, id_hash) DO UPDATE
SET data = excluded.data;
