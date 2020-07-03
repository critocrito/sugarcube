SELECT id,
       label,
       description
  FROM query_tag
 WHERE label = $label;
