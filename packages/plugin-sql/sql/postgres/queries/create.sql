INSERT INTO queries (type, term, data)
VALUES ${values:raw}
       ON CONFLICT (type, term) DO UPDATE
       SET
       updated_at = NOW(),
       data = excluded.data;
