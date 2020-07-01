CREATE TABLE IF NOT EXISTS unit (
    id INTEGER PRIMARY KEY,
    id_hash TEXT NOT NULL UNIQUE,
    id_fields JSON NOT NULL DEFAULT '[]',
    content_hash TEXT,
    content_fields JSON NOT NULL DEFAULT '[]',
    source TEXT NOT NULL,
    unit_id TEXT,
    body TEXT,
    href TEXT,
    author TEXT,
    title TEXT,
    description TEXT,
    language TEXT,
    created_at datetime WITH time zone,
    fetched_at datetime WITH time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime WITH time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data JSON DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS unit_id_hash_idx ON unit (id_hash);
CREATE INDEX IF NOT EXISTS unit_content_hash_idx ON unit (content_hash);
CREATE INDEX IF NOT EXISTS unit_source_idx ON unit (source);

CREATE TABLE IF NOT EXISTS download (
    id INTEGER PRIMARY KEY,
    unit INTEGER NOT NULL REFERENCES unit(id),
    id_hash TEXT NOT NULL,
    type TEXT NOT NULL,
    term TEXT NOT NULL,
    md5 TEXT,
    sha256 TEXT,
    location TEXT,
    data JSON DEFAULT '{}',
    UNIQUE(unit, id_hash)
);
CREATE INDEX IF NOT EXISTS download_id_hash_idx ON download (id_hash);
CREATE INDEX IF NOT EXISTS download_unit_idx ON download (unit);

CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY,
    unit INTEGER NOT NULL REFERENCES unit(id),
    id_hash TEXT NOT NULL,
    type TEXT NOT NULL,
    term TEXT NOT NULL,
    data JSON DEFAULT '{}',
    UNIQUE(unit, id_hash)
);
CREATE INDEX IF NOT EXISTS media_id_hash_idx ON media (id_hash);
CREATE INDEX IF NOT EXISTS media_unit_idx ON media (unit);

CREATE TABLE IF NOT EXISTS marker (
    id INTEGER PRIMARY KEY,
    marker TEXT NOT NULL UNIQUE,
    created_at datetime WITH time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data TEXT DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS marker_id_hash_idx ON marker (marker);

CREATE TABLE IF NOT EXISTS run (
    id INTEGER PRIMARY KEY,
    marker INTEGER NOT NULL REFERENCES marker(id),
    unit INTEGER NOT NULL REFERENCES unit(id),
    created_at datetime WITH time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(marker, unit)
);
CREATE INDEX IF NOT EXISTS run_marker_idx ON run (marker);
CREATE INDEX IF NOT EXISTS run_unit_idx ON run (unit);

CREATE TABLE IF NOT EXISTS query_result (
    id INTEGER PRIMARY KEY,
    query INTEGER NOT NULL REFERENCES query(id),
    unit INTEGER NOT NULL REFERENCES unit(id),
    UNIQUE(query, unit)
);
CREATE INDEX IF NOT EXISTS query_result_query_idx ON query_result (query);
CREATE INDEX IF NOT EXISTS query_result_unit_idx ON query_result (unit);
