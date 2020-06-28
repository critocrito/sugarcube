INSERT INTO query_tag (query, name, value)
VALUES ${values:raw}
    ON CONFLICT (query, name) DO UPDATE
   SET updated_at = NOW(),
       value = excluded.value;
