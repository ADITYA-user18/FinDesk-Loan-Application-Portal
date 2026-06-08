-- ============================================================
-- Vitto Loan Application Portal
-- Migration: 001_init.sql
-- Description: Initial schema – creates the applications table
-- ============================================================

-- Enable UUID extension (required for gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop table if it already exists (idempotent re-run safety)
DROP TABLE IF EXISTS applications;

-- Create applications table
CREATE TABLE applications (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255)    NOT NULL,
    mobile      VARCHAR(15)     NOT NULL,
    amount      NUMERIC(12, 2)  NOT NULL CHECK (amount > 0),
    purpose     VARCHAR(500)    NOT NULL,
    language    VARCHAR(50)     NOT NULL
                    CHECK (language IN ('Hindi', 'Tamil', 'Telugu', 'Marathi', 'English')),
    status      VARCHAR(20)     NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Index for status filtering (used by GET /api/applications?status=)
CREATE INDEX idx_applications_status    ON applications (status);

-- Index for created_at ordering (used by default sort: latest first)
CREATE INDEX idx_applications_created_at ON applications (created_at DESC);

-- Index for name/mobile search (bonus feature)
CREATE INDEX idx_applications_name      ON applications (name);
CREATE INDEX idx_applications_mobile    ON applications (mobile);

-- Confirm migration
DO $$
BEGIN
    RAISE NOTICE '001_init.sql applied successfully.';
END $$;
