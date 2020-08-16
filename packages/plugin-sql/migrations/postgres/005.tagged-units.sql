CREATE TABLE IF NOT EXISTS tagged_unit (
    id serial PRIMARY KEY,
    unit INTEGER NOT NULL REFERENCES unit(id),
    query_tag INTEGER NOT NULL REFERENCES query_tag(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (unit, query_tag)
);
CREATE INDEX IF NOT EXISTS tagged_unit_unit_idx ON tagged_unit (unit);
CREATE INDEX IF NOT EXISTS tagged_unit_query_tag_idx ON tagged_unit (query_tag);
