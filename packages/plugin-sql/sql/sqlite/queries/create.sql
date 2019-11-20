INSERT INTO queries (type, term, data)
VALUES ($type, $term, $data)
       ON CONFLICT (type, term) DO UPDATE
       SET
       updated_at = CURRENT_TIMESTAMP,
       data = json(excluded.data);
