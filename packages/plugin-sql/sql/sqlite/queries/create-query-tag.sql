INSERT INTO query_tag (query, name, value)
VALUES ($query, $name, $value)
    ON CONFLICT (query, name) DO UPDATE
   SET updated_at = CURRENT_TIMESTAMP,
       value = excluded.value;
