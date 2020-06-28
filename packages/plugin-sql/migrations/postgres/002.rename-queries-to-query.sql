BEGIN;

ALTER TABLE queries RENAME TO query;

ALTER INDEX queries_type RENAME TO query_type;
ALTER INDEX queries_term RENAME TO query_term;

ALTER TABLE query DROP COLUMN data;

CREATE TABLE query_tag (
    id serial PRIMARY KEY,
    query INTEGER NOT NULL REFERENCES query(id),
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(query, name)
);
CREATE INDEX query_tag_query_idx ON query_tag (query);
CREATE INDEX query_tag_name_idx ON query_tag (name);
CREATE INDEX query_tag_value_idx ON query_tag (value);

COMMIT;
