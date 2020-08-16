CREATE TABLE IF NOT EXISTS tagged_unit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit INTEGER NOT NULL REFERENCES unit(id),
    query_tag INTEGER NOT NULL REFERENCES query_tag(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (unit, query_tag)
);
CREATE INDEX IF NOT EXISTS tagged_unit_unit_idx ON tagged_unit (unit);
CREATE INDEX IF NOT EXISTS tagged_unit_query_tag_idx ON tagged_unit (query_tag);
