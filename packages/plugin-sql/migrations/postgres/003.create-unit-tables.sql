CREATE TABLE IF NOT EXISTS unit (
    id SERIAL PRIMARY KEY,
    id_hash TEXT NOT NULL UNIQUE,
    id_fields JSONB NOT NULL DEFAULT '[]',
    content_hash TEXT,
    content_fields JSONB NOT NULL DEFAULT '[]',
    source TEXT NOT NULL,
    unit_id TEXT,
    body TEXT,
    href TEXT,
    author TEXT,
    title TEXT,
    description TEXT,
    language TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data JSONB DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS unit_id_hash_idx ON unit (id_hash);
CREATE INDEX IF NOT EXISTS unit_content_hash_idx ON unit (content_hash);
CREATE INDEX IF NOT EXISTS unit_source_idx ON unit (source);

create table if not exists download (
    id SERIAL PRIMARY KEY,
    unit INT NOT NULL REFERENCES unit(id),
    id_hash TEXT NOT NULL,
    type TEXT NOT NULL,
    term TEXT NOT NULL,
    md5 TEXT,
    sha256 TEXT,
    location TEXT,
    data JSONB DEFAULT '{}',
    UNIQUE(unit, id_hash)
);
CREATE INDEX IF NOT EXISTS download_id_hash_idx ON download (id_hash);
CREATE INDEX IF NOT EXISTS download_unit_idx ON download (unit);

CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    unit INT NOT NULL REFERENCES unit(id),
    id_hash TEXT NOT NULL,
    type TEXT NOT NULL,
    term TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    UNIQUE(unit, id_hash)
);
CREATE INDEX IF NOT EXISTS media_id_hash_idx ON media (id_hash);
CREATE INDEX IF NOT EXISTS media_unit_idx ON media (unit);

CREATE TABLE IF NOT EXISTS marker (
    id SERIAL PRIMARY KEY,
    marker TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data TEXT DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS marker_id_hash_idx ON marker (marker);

CREATE TABLE IF NOT EXISTS run (
    id SERIAL PRIMARY KEY,
    marker INT NOT NULL  REFERENCES marker(id),
    unit INT NOT NULL REFERENCES unit(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(marker, unit)
);
CREATE INDEX IF NOT EXISTS run_marker_idx ON run (marker);
CREATE INDEX IF NOT EXISTS run_unit_idx ON run (unit);

CREATE TABLE IF NOT EXISTS query_result (
    id SERIAL PRIMARY KEY,
    query INT NOT NULL REFERENCES query(id),
    unit INT NOT NULL REFERENCES unit(id),
    UNIQUE(query, unit)
);
CREATE INDEX IF NOT EXISTS query_result_query_idx ON query_result (query);
CREATE INDEX IF NOT EXISTS query_result_unit_idx ON query_result (unit);
