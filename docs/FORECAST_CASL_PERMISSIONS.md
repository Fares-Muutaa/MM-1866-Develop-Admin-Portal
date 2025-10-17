# CASL Permissions pour les Routes Forecast

Ce document décrit les permissions CASL appliquées aux routes forecast et comment les gérer.

## Routes Protégées

### 1. `/api/forecast-data`
- **GET** - Lecture des données de forecast (nécessite `read:ForecastData`)
- **PUT** - Mise à jour des données de forecast (nécessite `update:ForecastData`)

### 2. `/api/forecast-executions`
- **GET** - Lecture des exécutions de forecast (nécessite `read:ForecastExecution`)

### 3. `/api/forecast-data-complete`
- **GET** - Lecture complète des données de forecast avec pagination (nécessite `read:ForecastData`)

### 4. `/api/forecast-types`
- **GET** - Lecture des types de forecast (nécessite `read:ForecastType`)

## Domaines de Permissions

### ForecastData
Gère l'accès aux données de forecast (valeurs, dates, produits).

**Actions disponibles:**
- `create` - Créer de nouvelles données de forecast
- `read` - Lire les données de forecast
- `update` - Modifier les données de forecast existantes
- `delete` - Supprimer les données de forecast

### ForecastExecution
Gère l'accès aux exécutions de forecast (historique des runs).

**Actions disponibles:**
- `create` - Créer une nouvelle exécution
- `read` - Lire les exécutions
- `update` - Modifier une exécution
- `delete` - Supprimer une exécution

### ForecastType
Gère l'accès aux types de forecast (configurations, styles).

**Actions disponibles:**
- `create` - Créer un nouveau type
- `read` - Lire les types
- `update` - Modifier un type
- `delete` - Supprimer un type

## Rôles et Permissions

### Admin
**Accès complet** sur tous les domaines:
- ✅ `create:ForecastData`
- ✅ `read:ForecastData`
- ✅ `update:ForecastData`
- ✅ `delete:ForecastData`
- ✅ `create:ForecastExecution`
- ✅ `read:ForecastExecution`
- ✅ `update:ForecastExecution`
- ✅ `delete:ForecastExecution`
- ✅ `create:ForecastType`
- ✅ `read:ForecastType`
- ✅ `update:ForecastType`
- ✅ `delete:ForecastType`

### User
**Lecture seule** sur tous les domaines:
- ✅ `read:ForecastData`
- ✅ `read:ForecastExecution`
- ✅ `read:ForecastType`

## Installation

### 1. Exécuter le script SQL
\`\`\`bash
# Exécuter le script de création des permissions
psql -U your_user -d your_database -f scripts/seed-forecast-permissions.sql
\`\`\`

Ou via l'interface v0:
- Le script `scripts/seed-forecast-permissions.sql` sera exécuté automatiquement

### 2. Assigner les rôles aux utilisateurs
\`\`\`sql
-- Assigner le rôle Admin à un utilisateur
INSERT INTO user_role (user_id, role_id)
SELECT u.id, r.role_id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'admin@example.com' AND r.name = 'Admin'
ON CONFLICT DO NOTHING;

-- Assigner le rôle User à un utilisateur
INSERT INTO user_role (user_id, role_id)
SELECT u.id, r.role_id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'user@example.com' AND r.name = 'User'
ON CONFLICT DO NOTHING;
\`\`\`

## Tester les Permissions

### Avec Postman

#### 1. Login en tant qu'Admin
\`\`\`http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_password"
}
\`\`\`

#### 2. Tester la lecture (Admin et User peuvent)
\`\`\`http
GET /api/forecast-data?productId=123
Cookie: next-auth.session-token=YOUR_SESSION_TOKEN
\`\`\`

**Réponse attendue:** 200 OK avec les données

#### 3. Tester la mise à jour (Seulement Admin peut)
\`\`\`http
PUT /api/forecast-data
Content-Type: application/json
Cookie: next-auth.session-token=YOUR_SESSION_TOKEN

{
  "productId": 123,
  "forecastTypeId": 1,
  "date": "2024-02-12",
  "value": "100"
}
\`\`\`

**Réponse attendue:**
- Admin: 200 OK avec les données mises à jour
- User: 403 Forbidden

#### 4. Login en tant qu'User et retester
\`\`\`http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
\`\`\`

Puis retester les requêtes ci-dessus pour vérifier que User ne peut que lire.

## Ajouter de Nouvelles Permissions

### 1. Créer la permission dans la base de données
\`\`\`sql
INSERT INTO permission (action, domain, description, created_at, updated_at)
VALUES ('export', 'ForecastData', 'Export forecast data to CSV', NOW(), NOW())
ON CONFLICT (action, domain) DO NOTHING;
\`\`\`

### 2. Assigner la permission à un rôle
\`\`\`sql
INSERT INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
CROSS JOIN permission p
WHERE r.name = 'Admin' AND p.action = 'export' AND p.domain = 'ForecastData'
ON CONFLICT DO NOTHING;
\`\`\`

### 3. Utiliser dans le code
\`\`\`typescript
export async function POST(request: Request) {
  const permissionCheck = await checkPermission(request, 'export', 'ForecastData')
  if (permissionCheck) return permissionCheck
  
  // Votre logique d'export ici
}
\`\`\`

## Dépannage

### Erreur: "Permission denied"
1. Vérifier que l'utilisateur a bien un rôle assigné:
\`\`\`sql
SELECT u.email, r.name
FROM users u
JOIN user_role ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE u.email = 'your_email@example.com';
\`\`\`

2. Vérifier que le rôle a bien les permissions:
\`\`\`sql
SELECT r.name, p.action, p.domain
FROM roles r
JOIN role_permission rp ON r.role_id = rp.role_id
JOIN permission p ON rp.permission_id = p.permission_id
WHERE r.name = 'Admin' AND p.domain IN ('ForecastData', 'ForecastExecution', 'ForecastType');
\`\`\`

### Erreur: "User not authenticated"
Vérifier que le cookie de session est bien envoyé dans la requête.

## Permissions Personnalisées par Utilisateur

Pour donner des permissions spécifiques à un utilisateur (en plus de son rôle):

\`\`\`sql
-- Donner la permission de mise à jour à un utilisateur spécifique
INSERT INTO user_permission (user_id, permission_id)
SELECT u.id, p.permission_id
FROM users u
CROSS JOIN permission p
WHERE u.email = 'special_user@example.com'
  AND p.action = 'update'
  AND p.domain = 'ForecastData'
ON CONFLICT DO NOTHING;
\`\`\`

L'utilisateur aura alors les permissions de son rôle + cette permission supplémentaire.
