INSERT INTO tagged_unit (unit, query_tag)
VALUES ($unit, $queryTag)
    ON CONFLICT (unit, query_tag) DO UPDATE
   SET updated_at = CURRENT_TIMESTAMP;
