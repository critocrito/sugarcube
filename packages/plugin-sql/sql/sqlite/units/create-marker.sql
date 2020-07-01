INSERT INTO marker (
  marker
) VALUES (
  $marker
) ON CONFLICT (marker) DO NOTHING;
