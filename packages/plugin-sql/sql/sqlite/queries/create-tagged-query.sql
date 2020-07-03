INSERT INTO tagged_query (query, query_tag)
VALUES ($query, $queryTag)
    ON CONFLICT (query, query_tag) DO UPDATE
   SET updated_at = CURRENT_TIMESTAMP;
