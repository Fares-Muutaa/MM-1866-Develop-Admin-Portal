# CASL Integration Guide

This document explains how CASL (an isomorphic authorization library) has been integrated into the project for dynamic, database-driven permissions.

## Overview

CASL provides fine-grained authorization control based on permissions stored in the database. The system supports:

- **Role-based permissions**: Permissions assigned to roles
- **Direct user permissions**: Permissions assigned directly to users
- **Dynamic permission loading**: Permissions are fetched from the database at runtime
- **Scope-based permissions**: Global, tenant, and resource-level permissions

## Database Schema

The following tables have been added to support CASL:

### Tables

1. **roles**: Defines roles (Admin, User, ForecastManager, etc.)
2. **permission**: Defines available permissions (domain, action, scope)
3. **user_role**: Links users to roles
4. **role_permission**: Links roles to permissions
5. **user_permission**: Direct user permissions (can override role permissions)

### Example Permissions

For the Forecast module:
- `Forecast.create` - Create forecast data
- `Forecast.read` - Read forecast data
- `Forecast.update` - Update forecast data
- `Forecast.delete` - Delete forecast data
- `Forecast.manage` - Full management access

## Usage

### Backend (API Routes)

Use the `checkPermission` middleware to protect API routes:

\`\`\`typescript
import { checkPermission } from "@/lib/casl/middleware"

export async function GET(request: NextRequest) {
  // Check if user has 'read' permission on 'Forecast'
  const permissionError = await checkPermission("read", "Forecast")
  if (permissionError) return permissionError

  // Your route logic here
}
\`\`\`

### Frontend (React Components)

Use the `Can` component to conditionally render UI based on permissions:

\`\`\`typescript
import { Can } from "@/lib/casl/permissions-provider"

function ForecastPage() {
  return (
    <div>
      <Can I="read" a="Forecast">
        <ForecastList />
      </Can>
      
      <Can I="create" a="Forecast">
        <CreateForecastButton />
      </Can>
    </div>
  )
}
\`\`\`

### Programmatic Permission Checks

Use the `useAbility` hook for programmatic checks:

\`\`\`typescript
import { useAbility } from "@/lib/casl/permissions-provider"

function MyComponent() {
  const ability = useAbility()
  
  if (ability.can("update", "Forecast")) {
    // Show update UI
  }
}
\`\`\`

## Setup

1. **Run the seed script** to create initial roles and permissions:
   \`\`\`bash
   # Execute the SQL script in your database
   psql -d your_database -f scripts/seed-casl-permissions.sql
   \`\`\`

2. **Assign roles to users** via the `user_role` table:
   \`\`\`sql
   INSERT INTO user_role (user_id, role_id) 
   VALUES (1, (SELECT role_id FROM roles WHERE name = 'Admin'));
   \`\`\`

3. **Install dependencies**:
   \`\`\`bash
   npm install @casl/ability @casl/react
   \`\`\`

## API Endpoints

### Get User Permissions
\`\`\`
GET /api/user/permissions
\`\`\`
Returns the current user's permissions as CASL rules.

### Forecast API (Protected)
\`\`\`
GET    /api/forecast  - Read forecasts (requires 'read' permission)
POST   /api/forecast  - Create forecast (requires 'create' permission)
PUT    /api/forecast  - Update forecast (requires 'update' permission)
DELETE /api/forecast  - Delete forecast (requires 'delete' permission)
\`\`\`

## Adding New Permissions

1. **Add permission to database**:
   \`\`\`sql
   INSERT INTO permission (domain, action, scope, description) 
   VALUES ('NewDomain', 'read', 'global', 'Read new domain data');
   \`\`\`

2. **Assign to roles**:
   \`\`\`sql
   INSERT INTO role_permission (role_id, permission_id)
   SELECT r.role_id, p.permission_id
   FROM roles r, permission p
   WHERE r.name = 'Admin' AND p.domain = 'NewDomain';
   \`\`\`

3. **Use in code**:
   \`\`\`typescript
   const permissionError = await checkPermission("read", "NewDomain")
   \`\`\`

## Permission Scopes

- **global**: Applies to all resources
- **tenant**: Applies to resources within a tenant/organization
- **resource**: Applies to specific resources (can use constraints)

## Constraints

You can add JSON constraints to permissions for fine-grained control:

\`\`\`sql
INSERT INTO role_permission (role_id, permission_id, constraints)
VALUES (
  (SELECT role_id FROM roles WHERE name = 'User'),
  (SELECT permission_id FROM permission WHERE domain = 'Forecast' AND action = 'read'),
  '{"organization_id": 123}'::jsonb
);
\`\`\`

This limits the permission to forecasts where `organization_id = 123`.
