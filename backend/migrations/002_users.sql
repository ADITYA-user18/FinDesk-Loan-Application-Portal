-- ============================================================
-- Migration: 002_users.sql
-- Adds users table and links applications to users
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255)  NOT NULL,
    mobile        VARCHAR(15)   NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          VARCHAR(20)   NOT NULL DEFAULT 'borrower'
                      CHECK (role IN ('borrower', 'agent')),
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_mobile ON users (mobile);

-- Link applications to users (nullable so existing rows are safe)
ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications (user_id);

DO $$
BEGIN
    RAISE NOTICE '002_users.sql applied successfully.';
END $$;
