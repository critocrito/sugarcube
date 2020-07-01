BEGIN;
CREATE SCHEMA IF NOT EXISTS sandbox;
CREATE TABLE IF NOT EXISTS sandbox.unit (
    id serial PRIMARY KEY,
    id_hash text NOT NULL,
    id_fields text[] NOT NULL DEFAULT '{}',
    source text NOT NULL,
    content_hash text,
    content_fields text[],
    body text,
    href text,
    author text,
    title text,
    description text,
    language text,
    created_at timestamp WITH time zone,
    fetched_at timestamp WITH time zone NOT NULL DEFAULT NOW(),
    data jsonb DEFAULT '{}',
    UNIQUE (id_hash)
);
CREATE INDEX IF NOT EXISTS unit_id_hash_idx ON sandbox.unit (id_hash);
CREATE INDEX IF NOT EXISTS unit_content_hash_idx ON sandbox.unit (content_hash);
CREATE INDEX IF NOT EXISTS unit_source_idx ON sandbox.unit (source);
CREATE TABLE IF NOT EXISTS sandbox.download (
    id serial PRIMARY KEY,
    unit integer NOT NULL REFERENCES sandbox.unit,
    id_hash text NOT NULL,
    type TEXT NOT NULL,
    term text NOT NULL,
    md5 text NOT NULL,
    sha256 text NOT NULL,
    data jsonb DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS download_id_hash_idx ON sandbox.download (id_hash);

CREATE TABLE IF NOT EXISTS sandbox.medias (
    id serial PRIMARY KEY,
    unit integer NOT NULL REFERENCES sandbox.unit,
    id_hash text NOT NULL,
    type TEXT NOT NULL,
    term text NOT NULL,
    data jsonb DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS medias_id_hash_idx ON sandbox.medias (id_hash);

INSERT INTO sandbox.unit (id_hash, source, id_fields)
    VALUES ('b6cbf6869f00a72b1105efec22d022436105651c130e03f2a773c0af3fef31d3', 'http_import', '{"aa", "bb"}');
INSERT INTO sandbox.download (unit, id_hash, TYPE, term)
    VALUES (1, 'aa', 'type1', 'term1');
INSERT INTO sandbox.download (unit, id_hash, TYPE, term)
    VALUES (1, 'bb', 'type2', 'term2');
SELECT
    id_hash,
    source,
    ARRAY (
        SELECT
            id_hash,
            TYPE,
            term
        FROM
            sandbox.download d
        WHERE
            u.id = d.unit) download
FROM
    sandbox.unit u;
ROLLBACK;
