SELECT qt.id AS id,
       qt.label AS label,
       qt.description AS description,
       tq.created_at AS created_at,
       tq.updated_at AS updated_at
  FROM tagged_query tq
  LEFT JOIN query_tag qt ON tq.query_tag = qt.id
 WHERE tq.query = $query;
