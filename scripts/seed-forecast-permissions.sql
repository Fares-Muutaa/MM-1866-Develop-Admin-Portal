-- ============================================
-- CASL Permissions for Forecast Routes
-- ============================================
-- This script creates permissions for:
-- - ForecastData (forecast-data, forecast-data-complete)
-- - ForecastExecution (forecast-executions)
-- - ForecastType (forecast-types)
--
-- Roles: Admin (full access), User (read only)
-- ============================================

-- Step 1: Create permissions for ForecastData domain
INSERT INTO permission (action, domain, description, created_at, updated_at)
VALUES
  ('create', 'ForecastData', 'Create forecast data', NOW(), NOW()),
  ('read', 'ForecastData', 'Read forecast data', NOW(), NOW()),
  ('update', 'ForecastData', 'Update forecast data', NOW(), NOW()),
  ('delete', 'ForecastData', 'Delete forecast data', NOW(), NOW())
ON CONFLICT (action, domain) DO NOTHING;

-- Step 2: Create permissions for ForecastExecution domain
INSERT INTO permission (action, domain, description, created_at, updated_at)
VALUES
  ('create', 'ForecastExecution', 'Create forecast execution', NOW(), NOW()),
  ('read', 'ForecastExecution', 'Read forecast execution', NOW(), NOW()),
  ('update', 'ForecastExecution', 'Update forecast execution', NOW(), NOW()),
  ('delete', 'ForecastExecution', 'Delete forecast execution', NOW(), NOW())
ON CONFLICT (action, domain) DO NOTHING;

-- Step 3: Create permissions for ForecastType domain
INSERT INTO permission (action, domain, description, created_at, updated_at)
VALUES
  ('create', 'ForecastType', 'Create forecast type', NOW(), NOW()),
  ('read', 'ForecastType', 'Read forecast type', NOW(), NOW()),
  ('update', 'ForecastType', 'Update forecast type', NOW(), NOW()),
  ('delete', 'ForecastType', 'Delete forecast type', NOW(), NOW())
ON CONFLICT (action, domain) DO NOTHING;

-- Step 4: Assign ALL permissions to Admin role
INSERT INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
CROSS JOIN permission p
WHERE r.name = 'Admin'
  AND p.domain IN ('ForecastData', 'ForecastExecution', 'ForecastType')
ON CONFLICT DO NOTHING;

-- Step 5: Assign READ ONLY permissions to User role
INSERT INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
CROSS JOIN permission p
WHERE r.name = 'User'
  AND p.domain IN ('ForecastData', 'ForecastExecution', 'ForecastType')
  AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- Verification queries (optional - comment out in production)
-- SELECT r.name as role, p.action, p.domain
-- FROM role_permission rp
-- JOIN roles r ON rp.role_id = r.role_id
-- JOIN permission p ON rp.permission_id = p.permission_id
-- WHERE p.domain IN ('ForecastData', 'ForecastExecution', 'ForecastType')
-- ORDER BY r.name, p.domain, p.action;
