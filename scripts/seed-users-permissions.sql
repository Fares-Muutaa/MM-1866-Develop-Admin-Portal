-- ============================================
-- CASL Permissions Setup for Users Domain
-- ============================================
-- This script creates permissions for the Users domain and assigns them to roles.
-- 
-- Roles:
--   - Admin: Full access (create, read, update, delete)
--   - User: Read only access
--
-- Run this script after seed-casl-permissions.sql
-- ============================================

-- Step 1: Create permissions for Users domain
INSERT INTO permission (action, domain, description)
VALUES
  ('create', 'User', 'Create users'),
  ('read', 'User', 'Read users'),
  ('update', 'User', 'Update users'),
  ('delete', 'User', 'Delete users')
ON CONFLICT DO NOTHING;

-- Step 2: Assign ALL permissions to Admin role
INSERT INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
CROSS JOIN permission p
WHERE r.name = 'Admin'
  AND p.domain = 'User'
ON CONFLICT DO NOTHING;

-- Step 3: Assign READ ONLY permissions to User role
INSERT INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
CROSS JOIN permission p
WHERE r.name = 'User'
  AND p.domain = 'User'
  AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- Verification queries (optional - comment out in production)
-- SELECT r.name as role, p.action, p.domain, p.description
-- FROM role_permission rp
-- JOIN roles r ON rp.role_id = r.role_id
-- JOIN permission p ON rp.permission_id = p.permission_id
-- WHERE p.domain = 'User'
-- ORDER BY r.name, p.action;
