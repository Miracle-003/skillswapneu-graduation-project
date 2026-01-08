-- Add indexes for better query performance when fetching matches
-- These indexes will speed up queries that filter by userId and status
CREATE INDEX IF NOT EXISTS "matches_user_id_1_status_idx" ON "matches"("user_id_1", "status");
CREATE INDEX IF NOT EXISTS "matches_user_id_2_status_idx" ON "matches"("user_id_2", "status");

-- Update the default status for new matches to 'suggestion'
-- This reflects the new workflow where matches are automatically generated as suggestions
-- Note: This does not change existing rows, only new inserts
ALTER TABLE "matches" ALTER COLUMN "status" SET DEFAULT 'suggestion';

-- Optional: Update existing pending matches to suggestion status
-- Uncomment the line below if you want to migrate existing 'pending' matches to 'suggestion'
-- UPDATE "matches" SET "status" = 'suggestion' WHERE "status" = 'pending';
