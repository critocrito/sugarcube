PRAGMA foreign_keys=OFF;

BEGIN;

CREATE TABLE IF NOT EXISTS query (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  term TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(type, term)
);

INSERT INTO query SELECT id, type, term, created_at, updated_at FROM queries;

DROP TABLE IF EXISTS queries;
DROP INDEX IF EXISTS queries_type;
DROP INDEX IF EXISTS queries_term;

CREATE INDEX IF NOT EXISTS query_type ON query (type);
CREATE INDEX IF NOT EXISTS query_term ON query (term);

COMMIT;

PRAGMA foreign_keys=ON;

CREATE TABLE query_tag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query INTEGER NOT NULL REFERENCES query(id),
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(query, name)
);
CREATE INDEX query_tag_query_idx ON query_tag (query);
CREATE INDEX query_tag_name_idx ON query_tag (name);
CREATE INDEX query_tag_value_idx ON query_tag (value);
