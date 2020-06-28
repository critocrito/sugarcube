SELECT id,
       type,
       term
  FROM query
 WHERE type = $type
   AND term = $term;
