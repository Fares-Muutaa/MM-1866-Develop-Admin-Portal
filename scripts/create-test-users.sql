-- Script pour créer des utilisateurs de test pour CASL
-- Exécuter ce script après seed-casl-permissions.sql

-- Créer un utilisateur Admin de test
INSERT INTO users (email, name, password, role, created_at, updated_at)
VALUES (
  'admin@example.com',
  'Admin Test User',
  -- Mot de passe hashé pour "admin123" (vous devrez le hasher avec bcrypt)
  '$2a$10$YourHashedPasswordHere',
  'Admin',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Créer un utilisateur User de test
INSERT INTO users (email, name, password, role, created_at, updated_at)
VALUES (
  'user@example.com',
  'User Test User',
  -- Mot de passe hashé pour "user123" (vous devrez le hasher avec bcrypt)
  '$2a$10$YourHashedPasswordHere',
  'User',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Assigner le rôle Admin à l'utilisateur admin
INSERT INTO user_role (user_id, role_id)
SELECT 
  u.id,
  r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'admin@example.com' AND r.name = 'Admin'
ON CONFLICT DO NOTHING;

-- Assigner le rôle User à l'utilisateur user
INSERT INTO user_role (user_id, role_id)
SELECT 
  u.id,
  r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'user@example.com' AND r.name = 'User'
ON CONFLICT DO NOTHING;

-- Vérifier les utilisateurs créés
SELECT 
  u.id,
  u.email,
  u.name,
  u.role as user_role_column,
  r.name as assigned_role
FROM users u
LEFT JOIN user_role ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email IN ('admin@example.com', 'user@example.com');
