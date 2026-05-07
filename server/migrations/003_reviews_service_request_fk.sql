-- RAT-133 data integrity hardening: reviews must reference existing service requests
-- Safe/conditional DDL to support local draft environments.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_requests') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints
      WHERE constraint_name = 'reviews_service_request_fk'
    ) THEN
      ALTER TABLE reviews
      ADD CONSTRAINT reviews_service_request_fk
      FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE RESTRICT;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_service_request_created_at
  ON reviews (service_request_id, created_at DESC);
