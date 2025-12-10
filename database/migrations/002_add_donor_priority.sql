-- Add donor priority fields and requester tracking

ALTER TABLE users
ADD COLUMN IF NOT EXISTS donation_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE requests
ADD COLUMN IF NOT EXISTS requester_id UUID NULL REFERENCES users(user_id) ON DELETE SET NULL;

-- Index to quickly find requests by requester
CREATE INDEX IF NOT EXISTS idx_requests_requester ON requests(requester_id);


