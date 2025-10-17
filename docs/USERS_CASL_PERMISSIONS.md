# CASL Permissions - Users Domain

## Vue d'ensemble

Ce document décrit les permissions CASL appliquées sur la route `/api/users` pour gérer l'accès aux utilisateurs.

## Permissions créées

### Domaine: User

| Action | Description | Admin | User |
|--------|-------------|-------|------|
| `create` | Créer des utilisateurs | ✅ | ❌ |
| `read` | Lire la liste des utilisateurs | ✅ | ✅ |
| `update` | Mettre à jour des utilisateurs | ✅ | ❌ |
| `delete` | Supprimer des utilisateurs | ✅ | ❌ |

## Routes protégées

### GET /api/users
- **Permission requise**: `read` sur `User`
- **Description**: Récupère la liste de tous les utilisateurs
- **Accès**:
  - ✅ Admin: Peut lire tous les utilisateurs
  - ✅ User: Peut lire tous les utilisateurs
  - ❌ Non authentifié: Accès refusé (401)

## Installation des permissions

### 1. Exécuter le script SQL

\`\`\`bash
# Depuis la racine du projet
psql -h <DB_HOST> -U <DB_USERNAME> -d <DB_NAME> -f scripts/seed-users-permissions.sql
\`\`\`

Ou via votre client PostgreSQL préféré (pgAdmin, DBeaver, etc.)

### 2. Vérifier les permissions

\`\`\`sql
SELECT r.name as role, p.action, p.domain, p.description
FROM role_permission rp
JOIN roles r ON rp.role_id = r.role_id
JOIN permission p ON rp.permission_id = p.permission_id
WHERE p.domain = 'User'
ORDER BY r.name, p.action;
\`\`\`

**Résultat attendu:**
\`\`\`
 role  | action | domain | description
-------+--------+--------+------------------
 Admin | create | User   | Create users
 Admin | delete | User   | Delete users
 Admin | read   | User   | Read users
 Admin | update | User   | Update users
 User  | read   | User   | Read users
\`\`\`

## Tests avec Postman

### Configuration

1. **Créer une collection** "Users CASL Tests"
2. **Ajouter les variables**:
   - `base_url`: `http://localhost:3000`
   - `admin_token`: Token JWT d'un admin
   - `user_token`: Token JWT d'un user

### Test 1: Admin peut lire les utilisateurs

\`\`\`http
GET {{base_url}}/api/users
Authorization: Bearer {{admin_token}}
\`\`\`

**Réponse attendue**: `200 OK`
\`\`\`json
{
  "user": [
    {
      "id": 1,
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "Admin"
    },
    ...
  ]
}
\`\`\`

### Test 2: User peut lire les utilisateurs

\`\`\`http
GET {{base_url}}/api/users
Authorization: Bearer {{user_token}}
\`\`\`

**Réponse attendue**: `200 OK`
\`\`\`json
{
  "user": [...]
}
\`\`\`

### Test 3: Non authentifié ne peut pas accéder

\`\`\`http
GET {{base_url}}/api/users
\`\`\`

**Réponse attendue**: `401 Unauthorized`
\`\`\`json
{
  "error": "Not authenticated"
}
\`\`\`

## Gestion des permissions

### Ajouter une permission à un utilisateur spécifique

Si vous voulez donner à un utilisateur spécifique la permission de créer des utilisateurs:

\`\`\`sql
-- Trouver l'ID de l'utilisateur
SELECT user_id, email FROM users WHERE email = 'user@example.com';

-- Trouver l'ID de la permission
SELECT permission_id FROM permission WHERE action = 'create' AND domain = 'User';

-- Assigner la permission
INSERT INTO user_permission (user_id, permission_id)
VALUES (123, 456)
ON CONFLICT DO NOTHING;
\`\`\`

### Retirer une permission d'un rôle

\`\`\`sql
DELETE FROM role_permission
WHERE role_id = (SELECT role_id FROM roles WHERE name = 'User')
  AND permission_id = (SELECT permission_id FROM permission WHERE action = 'read' AND domain = 'User');
\`\`\`

## Extension future

Lorsque vous ajouterez les méthodes POST, PUT, DELETE à la route users:

\`\`\`typescript
// POST /api/users - Créer un utilisateur
export async function POST(request: NextRequest) {
  const permissionCheck = await checkPermission(request, "create", "User")
  if (permissionCheck) return permissionCheck
  
  // ... logique de création
}

// PUT /api/users - Mettre à jour un utilisateur
export async function PUT(request: NextRequest) {
  const permissionCheck = await checkPermission(request, "update", "User")
  if (permissionCheck) return permissionCheck
  
  // ... logique de mise à jour
}

// DELETE /api/users - Supprimer un utilisateur
export async function DELETE(request: NextRequest) {
  const permissionCheck = await checkPermission(request, "delete", "User")
  if (permissionCheck) return permissionCheck
  
  // ... logique de suppression
}
\`\`\`

## Dépannage

### Erreur: "Forbidden: Insufficient permissions"

**Cause**: L'utilisateur n'a pas la permission requise

**Solution**:
1. Vérifier que le script SQL a été exécuté
2. Vérifier les permissions de l'utilisateur:
\`\`\`sql
SELECT p.action, p.domain
FROM user_permission up
JOIN permission p ON up.permission_id = p.permission_id
WHERE up.user_id = <USER_ID>
UNION
SELECT p.action, p.domain
FROM user_role ur
JOIN role_permission rp ON ur.role_id = rp.role_id
JOIN permission p ON rp.permission_id = p.permission_id
WHERE ur.user_id = <USER_ID>;
\`\`\`

### Erreur: "Not authenticated"

**Cause**: Token JWT manquant ou invalide

**Solution**:
1. Vérifier que le header `Authorization: Bearer <token>` est présent
2. Vérifier que le token n'est pas expiré
3. Se reconnecter pour obtenir un nouveau token

## Ressources

- [Documentation CASL](https://casl.js.org/v6/en/)
- [Guide d'intégration CASL](./CASL_INTEGRATION.md)
- [Tests Postman](../postman/CASL_Tests.postman_collection.json)
