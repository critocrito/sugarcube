CREATE TABLE IF NOT EXISTS queries (
  id serial PRIMARY KEY,
  type TEXT NOT NULL,
  term TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data JSONB DEFAULT '{}',
  UNIQUE(type, term)
);

CREATE INDEX IF NOT EXISTS queries_type ON queries (type);
CREATE INDEX IF NOT EXISTS queries_term ON queries (term);
