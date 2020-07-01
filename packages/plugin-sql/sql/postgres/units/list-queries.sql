SELECT q.type,
       q.term
  FROM query q
  LEFT JOIN query_result qr ON qr.query = q.id
 WHERE qr.unit = ${unitId};
