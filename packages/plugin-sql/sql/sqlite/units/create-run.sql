INSERT INTO run (
  marker,
  unit
) VALUES (
  $marker,
  $unit
) ON CONFLICT (marker, unit) DO NOTHING;
