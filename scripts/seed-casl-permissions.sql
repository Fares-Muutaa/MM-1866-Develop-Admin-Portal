-- Seed script for CASL permissions system
-- This creates initial roles and permissions for the forecast module

-- Insert roles
INSERT INTO roles (name, description, is_builtin) VALUES
('Admin', 'Administrator with full access', true),
('User', 'Regular user with limited access', true),
('ForecastManager', 'Can manage forecasts', false),
('ForecastViewer', 'Can only view forecasts', false)
ON CONFLICT (name) DO NOTHING;

-- Insert permissions for Forecast domain
INSERT INTO permission (domain, action, scope, description) VALUES
('Forecast', 'create', 'global', 'Create forecast data'),
('Forecast', 'read', 'global', 'Read forecast data'),
('Forecast', 'update', 'global', 'Update forecast data'),
('Forecast', 'delete', 'global', 'Delete forecast data'),
('Forecast', 'manage', 'global', 'Full management of forecasts'),
('ForecastData', 'create', 'resource', 'Create forecast data entries'),
('ForecastData', 'read', 'resource', 'Read forecast data entries'),
('ForecastData', 'update', 'resource', 'Update forecast data entries'),
('ForecastData', 'delete', 'resource', 'Delete forecast data entries'),
('ForecastType', 'create', 'global', 'Create forecast types'),
('ForecastType', 'read', 'global', 'Read forecast types'),
('ForecastType', 'update', 'global', 'Update forecast types'),
('ForecastType', 'delete', 'global', 'Delete forecast types')
ON CONFLICT DO NOTHING;

-- Assign permissions to Admin role (full access)
INSERT INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
CROSS JOIN permission p
WHERE r.name = 'Admin' AND p.domain IN ('Forecast', 'ForecastData', 'ForecastType')
ON CONFLICT DO NOTHING;

-- Assign permissions to ForecastManager role (manage forecasts)
INSERT INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
CROSS JOIN permission p
WHERE r.name = 'ForecastManager' 
  AND p.domain IN ('Forecast', 'ForecastData', 'ForecastType')
  AND p.action IN ('create', 'read', 'update')
ON CONFLICT DO NOTHING;

-- Assign permissions to ForecastViewer role (read only)
INSERT INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
CROSS JOIN permission p
WHERE r.name = 'ForecastViewer' 
  AND p.domain IN ('Forecast', 'ForecastData', 'ForecastType')
  AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- Assign permissions to User role (read forecasts)
INSERT INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
CROSS JOIN permission p
WHERE r.name = 'User' 
  AND p.domain IN ('Forecast', 'ForecastData')
  AND p.action = 'read'
ON CONFLICT DO NOTHING;
