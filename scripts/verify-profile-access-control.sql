-- Profile access-control verification helper.
--
-- Run this in Supabase SQL Editor after applying the migration.
-- This script inspects policies and privileges. It does not fully simulate
-- an authenticated client request. For client-level mutation checks, use
-- REST/API requests with a real client JWT.

-- 1. Check RLS policies on public.profiles.
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'profiles'
order by policyname;

-- Expected:
-- - "Users can view own profile" should exist for SELECT.
-- - "Users can update own profile full name" should exist for UPDATE.
-- - "Users can update own profile" should NOT exist anymore.

-- 2. Check table-level privileges for authenticated.
select
  grantee,
  table_schema,
  table_name,
  privilege_type
from information_schema.table_privileges
where table_schema = 'public'
  and table_name = 'profiles'
  and grantee = 'authenticated'
order by privilege_type;

-- Expected:
-- - SELECT may exist.
-- - broad table-level UPDATE should NOT exist.

-- 3. Check column-level privileges for authenticated.
select
  grantee,
  table_schema,
  table_name,
  column_name,
  privilege_type
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'profiles'
  and grantee = 'authenticated'
order by column_name, privilege_type;

-- Expected:
-- - UPDATE should exist for full_name.
-- - UPDATE should NOT exist for role.
-- - UPDATE should NOT exist for member_id.

-- 4. Manual API verification checklist:
--
-- As an authenticated client user:
-- - SELECT own profile should succeed.
-- - UPDATE own full_name should succeed.
-- - UPDATE own role should fail.
-- - UPDATE own member_id should fail.
-- - UPDATE another user's full_name should update 0 rows or fail due to RLS.