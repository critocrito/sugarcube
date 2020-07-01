BEGIN;
CREATE TABLE IF NOT EXISTS unit (
    id integer PRIMARY KEY,
    id_hash text NOT NULL,
    id_fields json NOT NULL DEFAULT '[]',
    content_hash text,
    content_fields json NOT NULL DEFAULT '[]',
    source text NOT NULL,
    unit_id text,
    body text,
    href text,
    author text,
    title text,
    description text,
    language text,
    created_at datetime WITH time zone,
    fetched_at datetime WITH time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data json DEFAULT '{}',
    UNIQUE (id_hash)
);
CREATE INDEX IF NOT EXISTS unit_id_hash_idx ON unit (id_hash);
CREATE INDEX IF NOT EXISTS unit_content_hash_idx ON unit (content_hash);
CREATE INDEX IF NOT EXISTS unit_source_idx ON unit (source);

create table if not exists download (
    id integer primary key,
    unit integer NOT NULL,
    id_hash text NOT NULL,
    type text NOT NULL,
    term text NOT NULL,
    md5 text,
    sha256 text,
    location text,
    data jsonb default '{}',
    foreign key(unit) references unit(id),
    UNIQUE(type, term)
);
create index if not exists download_id_hash_idx on download (id_hash);
create index if not exists download_unit_idx on download (unit);

CREATE TABLE IF NOT EXISTS media (
    id integer PRIMARY KEY,
    unit integer NOT NULL,
    id_hash text NOT NULL,
    type text NOT NULL,
    term text NOT NULL,
    data jsonb default '{}',
    foreign key(unit) references unit(id),
    UNIQUE(type, term)
);
create index if not exists media_id_hash_idx on media (id_hash);
create index if not exists media_unit_idx on media (unit);

CREATE TABLE IF NOT EXISTS marker (
    id integer PRIMARY KEY,
    id_hash text NOT NULL,
    created_at datetime WITH time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data TEXT DEFAULT '{}',
    UNIQUE(id_hash)
);
CREATE INDEX IF NOT EXISTS marker_id_hash_idx ON marker (id_hash);

CREATE TABLE IF NOT EXISTS run (
    id integer PRIMARY KEY,
    marker integer NOT NULL,
    unit integer NOT NULL,
    FOREIGN KEY(marker) REFERENCES marker(id),
    FOREIGN KEY(unit) REFERENCES unit(id),
    UNIQUE(marker, unit)
);
CREATE INDEX IF NOT EXISTS run_marker_idx ON run (marker);
CREATE INDEX IF NOT EXISTS run_unit_idx ON run (unit);

CREATE TABLE IF NOT EXISTS query (
    id INTEGER PRIMARY KEY,
    type TEXT NOT NULL,
    term TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    data TEXT DEFAULT '{}',
    UNIQUE(type, term)
);

CREATE INDEX IF NOT EXISTS queries_type ON queries (type);
CREATE INDEX IF NOT EXISTS queries_term ON queries (term);

CREATE TABLE IF NOT EXISTS query_result (
    id integer PRIMARY KEY,
    query integer NOT NULL,
    unit integer NOT NULL,
    FOREIGN KEY(query) REFERENCES query(id),
    FOREIGN KEY(unit) REFERENCES unit(id),
    UNIQUE(query, unit)
);
CREATE INDEX IF NOT EXISTS query_result_query_idx ON query_result (query);
CREATE INDEX IF NOT EXISTS query_result_unit_idx ON query_result (unit);

SELECT m.id_hash, m.type, m.term from media m JOIN unit u on u.id = m.unit where u.id_hash = '0003901f9089c604c9f805f8f8f218280b6d9a3f91b7e4d2706f545cec9b5f75';

WITH a AS (
     SELECT
        m.id_hash AS id_hash,
        m.type as type,
        m.term as term
     from media m
       JOIN unit u on u.id = m.unit
     where u.id_hash = '0003901f9089c604c9f805f8f8f218280b6d9a3f91b7e4d2706f545cec9b5f75'
)
SELECT json_group_array(json_object('id_hash', id_hash, 'type', type, 'term', term)) from a;

WITH a AS (
     SELECT
        m.id_hash AS id_hash,
        m.type as type,
        m.term as term
     from media m
       JOIN unit u on u.id = m.unit
     where u.source = 'twitter_tweets'
)
select count(*) from a;
SELECT json_group_array(json_object('id_hash', id_hash, 'type', type, 'term', term)) from a;

WITH media_agg AS (
     SELECT
        m.id_hash AS unit_id_hash,
        m.type as type,
        m.term as term
     from media m
       JOIN unit u on u.id = m.unit
     where u.source = 'twitter_tweets'
)
SELECT count(*)
FROM (
EXPLAIN QUERY PLAN SELECT
  u.id as id,
  u.id_hash AS id_hash,
  (SELECT json_group_array(val) from (
     SELECT
        json_object(
        'id_hash', m.id_hash,
        'type', m.type,
        'term', m.term
        ) as val
     from media m
     where m.unit = u.id
  ) t) AS media
FROM unit u
WHERE source = 'youtube_video' OR source = 'youtube_channel'
GROUP BY u.id_hash
) g;
LIMIT 10;

  -- json_object('sc_media', json_array(json_object('type', m.type, 'term', m.term, 'id_hash', m.id_hash)))
 -- join media m on u.id = m.unit
ROLLBACK;
