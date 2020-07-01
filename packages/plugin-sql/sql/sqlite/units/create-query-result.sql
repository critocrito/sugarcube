INSERT INTO query_result (
  query,
  unit
) VALUES (
  $query,
  $unit
) ON CONFLICT (query, unit) DO NOTHING;
