-- Migration: Restrict admin privileges to jtech221plus@gmail.com only
-- Created: 2026-06-16

-- 1. Reset admin flag for all users
UPDATE public.pf_profiles SET is_admin = FALSE;

-- 2. Grant admin privileges only to the user with email jtech221plus@gmail.com
UPDATE public.pf_profiles
SET is_admin = TRUE
WHERE id IN (
    SELECT id FROM auth.users WHERE LOWER(email) = 'jtech221plus@gmail.com'
);
