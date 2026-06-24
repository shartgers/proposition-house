CREATE TABLE case_offerings (
  case_id     uuid NOT NULL REFERENCES cases(id)    ON DELETE CASCADE,
  offering_id uuid NOT NULL REFERENCES offerings(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (case_id, offering_id)
);

CREATE INDEX ON case_offerings (offering_id);

-- RLS
ALTER TABLE case_offerings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read case_offerings"
  ON case_offerings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage case_offerings"
  ON case_offerings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
