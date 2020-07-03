BEGIN;

CREATE TABLE IF NOT EXISTS query_tag_new (
    id serial PRIMARY KEY,
    label TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tagged_query (
    id serial PRIMARY KEY,
    query INTEGER NOT NULL REFERENCES query(id),
    query_tag INTEGER NOT NULL REFERENCES query_tag_new(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (query, query_tag)
);

INSERT INTO query_tag_new(id, label, created_at, updated_at) SELECT id, value AS label, created_at, updated_at FROM query_tag;
INSERT INTO tagged_query(query, query_tag, created_at, updated_at) SELECT query, id AS query_tag, created_at, updated_at FROM query_tag;

DROP TABLE IF EXISTS query_tag;
DROP INDEX IF EXISTS query_tag_query_idx;
DROP INDEX IF EXISTS query_tag_name;
DROP INDEX IF EXISTS query_tag_value;

ALTER TABLE query_tag_new RENAME TO query_tag;

CREATE INDEX IF NOT EXISTS query_tag_label_idx ON query_tag (label);
CREATE INDEX IF NOT EXISTS tagged_query_query_idx ON tagged_query (query);
CREATE INDEX IF NOT EXISTS tagged_query_query_tag_idx ON tagged_query (query_tag);

COMMIT;
