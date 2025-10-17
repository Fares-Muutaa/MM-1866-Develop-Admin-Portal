# Guide de Test CASL avec Postman

Ce guide explique comment tester l'intégration CASL dans le projet.

## Prérequis

1. **Exécuter le script SQL de seed**
   - Le script `scripts/seed-casl-permissions.sql` doit être exécuté pour créer les tables et les données initiales
   - Cela créera les rôles Admin et User avec leurs permissions respectives

2. **Avoir des utilisateurs dans la base de données**
   - Au moins un utilisateur avec le rôle Admin
   - Au moins un utilisateur avec le rôle User

## Étape 1: Authentification

### 1.1 Se connecter via NextAuth

**Endpoint:** `POST /api/auth/callback/credentials`

**Body (JSON):**
\`\`\`json
{
  "email": "admin@example.com",
  "password": "votre_mot_de_passe",
  "redirect": false
}
\`\`\`

**Réponse attendue:**
\`\`\`json
{
  "ok": true,
  "status": 200,
  "url": null
}
\`\`\`

**Important:** Après cette requête, Postman recevra un cookie de session `next-auth.session-token`. Ce cookie sera automatiquement inclus dans les requêtes suivantes.

### 1.2 Alternative: Obtenir la session manuellement

Si vous testez depuis le navigateur, vous pouvez:
1. Vous connecter via l'interface web
2. Ouvrir les DevTools (F12)
3. Aller dans Application > Cookies
4. Copier la valeur du cookie `next-auth.session-token`
5. L'ajouter manuellement dans Postman

## Étape 2: Tester les Permissions sur les Forecasts

### 2.1 Vérifier vos permissions

**Endpoint:** `GET /api/user/permissions`

**Headers:**
\`\`\`
Cookie: next-auth.session-token=VOTRE_TOKEN
\`\`\`

**Réponse attendue (Admin):**
\`\`\`json
{
  "success": true,
  "permissions": [
    { "action": "create", "subject": "Forecast" },
    { "action": "read", "subject": "Forecast" },
    { "action": "update", "subject": "Forecast" },
    { "action": "delete", "subject": "Forecast" }
  ]
}
\`\`\`

**Réponse attendue (User):**
\`\`\`json
{
  "success": true,
  "permissions": [
    { "action": "read", "subject": "Forecast" }
  ]
}
\`\`\`

### 2.2 Lire les forecasts (Autorisé pour Admin et User)

**Endpoint:** `GET /api/forecast`

**Headers:**
\`\`\`
Cookie: next-auth.session-token=VOTRE_TOKEN
\`\`\`

**Réponse attendue (succès):**
\`\`\`json
{
  "success": true,
  "data": [...]
}
\`\`\`

### 2.3 Créer un forecast (Autorisé uniquement pour Admin)

**Endpoint:** `POST /api/forecast`

**Headers:**
\`\`\`
Cookie: next-auth.session-token=VOTRE_TOKEN
Content-Type: application/json
\`\`\`

**Body (JSON):**
\`\`\`json
{
  "productId": 1,
  "forecastDate": "2024-01-15",
  "quantity": 1000,
  "confidence": 0.85
}
\`\`\`

**Réponse attendue (Admin - succès):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 123,
    "productId": 1,
    "forecastDate": "2024-01-15",
    ...
  }
}
\`\`\`

**Réponse attendue (User - refusé):**
\`\`\`json
{
  "error": "Forbidden: You don't have permission to perform this action"
}
\`\`\`
**Status:** 403

### 2.4 Mettre à jour un forecast (Autorisé uniquement pour Admin)

**Endpoint:** `PUT /api/forecast`

**Headers:**
\`\`\`
Cookie: next-auth.session-token=VOTRE_TOKEN
Content-Type: application/json
\`\`\`

**Body (JSON):**
\`\`\`json
{
  "id": 123,
  "quantity": 1500,
  "confidence": 0.90
}
\`\`\`

**Réponse attendue (Admin - succès):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 123,
    "quantity": 1500,
    ...
  }
}
\`\`\`

**Réponse attendue (User - refusé):**
\`\`\`json
{
  "error": "Forbidden: You don't have permission to perform this action"
}
\`\`\`
**Status:** 403

### 2.5 Supprimer un forecast (Autorisé uniquement pour Admin)

**Endpoint:** `DELETE /api/forecast?id=123`

**Headers:**
\`\`\`
Cookie: next-auth.session-token=VOTRE_TOKEN
\`\`\`

**Réponse attendue (Admin - succès):**
\`\`\`json
{
  "success": true,
  "message": "Forecast deleted successfully"
}
\`\`\`

**Réponse attendue (User - refusé):**
\`\`\`json
{
  "error": "Forbidden: You don't have permission to perform this action"
}
\`\`\`
**Status:** 403

## Étape 3: Configuration de Postman

### 3.1 Créer une Collection

1. Créer une nouvelle collection "CASL Tests"
2. Ajouter une variable d'environnement `baseUrl` = `http://localhost:3000`
3. Ajouter une variable `sessionToken` (sera remplie après login)

### 3.2 Script de Pre-request pour l'authentification

Dans les paramètres de la collection, ajouter ce script Pre-request:

\`\`\`javascript
// Si le token n'existe pas, faire une requête de login
if (!pm.environment.get("sessionToken")) {
    pm.sendRequest({
        url: pm.environment.get("baseUrl") + "/api/auth/callback/credentials",
        method: 'POST',
        header: {
            'Content-Type': 'application/json',
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                email: "admin@example.com",
                password: "votre_mot_de_passe",
                redirect: false
            })
        }
    }, function (err, res) {
        if (!err) {
            // Extraire le cookie de session
            const cookies = res.headers.get('set-cookie');
            if (cookies) {
                const sessionToken = cookies.match(/next-auth\.session-token=([^;]+)/);
                if (sessionToken) {
                    pm.environment.set("sessionToken", sessionToken[1]);
                }
            }
        }
    });
}
\`\`\`

### 3.3 Ajouter le Cookie automatiquement

Dans chaque requête, ajouter dans l'onglet Headers:
\`\`\`
Cookie: next-auth.session-token={{sessionToken}}
\`\`\`

## Étape 4: Scénarios de Test

### Scénario 1: Admin avec tous les droits
1. Se connecter en tant qu'Admin
2. Vérifier les permissions (GET /api/user/permissions)
3. Lire les forecasts (GET /api/forecast) ✅
4. Créer un forecast (POST /api/forecast) ✅
5. Mettre à jour un forecast (PUT /api/forecast) ✅
6. Supprimer un forecast (DELETE /api/forecast) ✅

### Scénario 2: User avec droits limités
1. Se connecter en tant qu'User
2. Vérifier les permissions (GET /api/user/permissions)
3. Lire les forecasts (GET /api/forecast) ✅
4. Créer un forecast (POST /api/forecast) ❌ 403
5. Mettre à jour un forecast (PUT /api/forecast) ❌ 403
6. Supprimer un forecast (DELETE /api/forecast) ❌ 403

### Scénario 3: Utilisateur non authentifié
1. Ne pas envoyer de cookie de session
2. Toutes les requêtes devraient retourner 401 Unauthorized

## Étape 5: Ajouter des Permissions Personnalisées

### 5.1 Ajouter une permission directe à un utilisateur

\`\`\`sql
-- Donner la permission "update" sur "Forecast" à l'utilisateur ID 5
INSERT INTO user_permission (user_id, permission_id)
SELECT 5, id FROM permission 
WHERE action = 'update' AND subject = 'Forecast';
\`\`\`

### 5.2 Créer un nouveau rôle

\`\`\`sql
-- Créer un rôle "Manager"
INSERT INTO roles (name, description) VALUES ('Manager', 'Can read and update forecasts');

-- Assigner les permissions au rôle
INSERT INTO role_permission (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'Manager'),
  id 
FROM permission 
WHERE subject = 'Forecast' AND action IN ('read', 'update');

-- Assigner le rôle à un utilisateur
INSERT INTO user_role (user_id, role_id)
VALUES (6, (SELECT id FROM roles WHERE name = 'Manager'));
\`\`\`

## Dépannage

### Problème: 401 Unauthorized
- Vérifier que le cookie de session est bien envoyé
- Vérifier que la session n'a pas expiré
- Se reconnecter

### Problème: 403 Forbidden
- Vérifier les permissions de l'utilisateur (GET /api/user/permissions)
- Vérifier que les rôles sont bien assignés dans la base de données
- Vérifier que le script de seed a été exécuté

### Problème: 500 Internal Server Error
- Vérifier les logs du serveur
- Vérifier que les tables CASL existent dans la base de données
- Vérifier la connexion à la base de données

## Logs de Debug

Pour voir les logs de debug CASL, chercher dans la console du serveur les messages commençant par `[v0]`:

\`\`\`
[v0] Error fetching forecasts: ...
[v0] Error creating forecast: ...
