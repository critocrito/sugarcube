SELECT m.marker AS marker
  FROM marker m
  LEFT JOIN run r ON r.marker = m.id
 WHERE r.unit = $unitId;
