INSERT INTO query_tag (label, description)
VALUES (${label}, ${description})
    ON CONFLICT (label) DO UPDATE
   SET updated_at = NOW(),
       description = excluded.description
RETURNING ID;
