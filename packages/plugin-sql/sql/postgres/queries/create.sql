INSERT INTO query (type, term)
VALUES (${type}, ${term})
    ON CONFLICT (type, term) DO UPDATE
   SET updated_at = NOW()
RETURNING ID;
