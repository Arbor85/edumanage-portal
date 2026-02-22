# Auth0 Roles Setup Guide

This guide explains how to configure Auth0 roles so users are automatically assigned the correct access level (plan, gym, or platform) when they log in.

## Overview

Previously, users selected their role from a dropdown on login. Now, roles are managed in Auth0 and automatically retrieved during authentication.

## Step 1: Create Roles in Auth0

1. **Login to Auth0 Dashboard** → https://manage.auth0.com/
2. Go to **User Management** → **Roles**
3. Click **Create Role**

Create the following roles:

### Role 1: Plan User
- **Name**: `plan`
- **Description**: User with access to training plans and schedules

### Role 2: Gym User  
- **Name**: `gym`
- **Description**: User with access to fitness/workout features

### Role 3: Platform User
- **Name**: `platform`  
- **Description**: User with access to subscription and platform management

Save each role.

## Step 2: Assign Roles to Users

### Via Auth0 Dashboard:
1. Go to **User Management** → **Users**
2. Select a user
3. Go to **Roles** tab
4. Click **Assign Roles**
5. Select the appropriate role(s)

### Via Auth0 API:
```bash
curl --request POST \
  --url https://YOUR_DOMAIN/api/v2/users/USER_ID/roles \
  --header 'authorization: Bearer YOUR_MANAGEMENT_API_TOKEN' \
  --header 'content-type: application/json' \
  --data '{"roles":["ROLE_ID"]}'
```

## Step 3: Add Role Claim to Token

To include roles in the userinfo response, create an Auth0 Action:

1. Go to **Actions** → **Flows** → **Login**
2. Click **Add Action** → **Create New Action**
3. Select **Post-Login** trigger
4. Name: `Add Roles to Userinfo`
5. Use this code:

```javascript
/**
 * Handler that will be called during the post-login flow.
 * Add roles to the userinfo namespace
 */
exports.onPostLogin = async (event, api) => {
  const namespace = 'https://edumanage.com';
  
  if (event.authorization) {
    api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
    api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
  }
};
```

6. Click **Save**
7. Deploy the action
8. Go back to **Login** flow and add your action to the flow

## Step 4: Test Role Assignment

After setup, login and check browser devtools:

1. Open **DevTools** → **Application** → **Local Storage**
2. Find `auth0_session` key
3. Check the `user` object contains roles:

```json
{
  "sub": "auth0|...",
  "name": "John Doe",
  "email": "john@example.com",
  "https://edumanage.com/roles": ["plan"]
}
```

## Role Mapping

The application maps Auth0 roles to access levels:

| Auth0 Role | App Access Level | Pages |
|-----------|------------------|-------|
| `plan` | plan | Training plans, schedules, rooms |
| `gym` | gym | Workouts, analytics, exercises |
| `fitness` | gym | Alternative to "gym" (mapped) |
| `platform` | platform | Subscriptions, user management |
| `admin` | platform | Mapped to platform (full access) |
| (no role) | plan | Default fallback |

### Custom Mapping

To change the role mapping, edit [AuthContext.tsx](contexts/AuthContext.tsx):

```typescript
function mapAuth0RoleToAppRole(auth0Role: string | null): UserRole {
  if (!auth0Role) return 'plan';
  
  const roleMap: Record<string, UserRole> = {
    'plan': 'plan',
    'gym': 'gym',
    'fitness': 'gym',        // Add custom mappings here
    'trainer': 'gym',         // Example: trainers get gym access
    'platform': 'platform',
    'admin': 'platform'
  };
  
  return roleMap[auth0Role.toLowerCase()] || 'plan';
}
```

## Understanding the Role Flow

```mermaid
graph LR
    A["1. User logs in"] --> B["2. Auth0 login page"]
    B --> C["3. Auth0 validates credentials"]
    C --> D["4. Post-Login Action adds role claim"]
    D --> E["5. Callback returns code to app"]
    E --> F["6. Backend exchanges code for token"]
    F --> G["7. App fetches userinfo with roles"]
    G --> H["8. Role mapped to app access level"]
    H --> I["9. User redirected to correct dashboard"]
```

## Troubleshooting

### Roles Not Appearing in Userinfo

**Problem**: Roles not shown in localStorage `auth0_session`

**Solutions**:
1. Verify Post-Login action is deployed
2. Check action is added to Login flow
3. Clear browser cache and try again
4. Check Auth0 logs for errors (Actions → Runtime)

### User Getting Wrong Access Level

**Problem**: User has 'gym' role but can't access gym features

**Solutions**:
1. Verify role is assigned in Auth0 dashboard
2. Logout and login again (force refresh)
3. Check role naming matches configuration (case-sensitive)
4. Verify ProtectedRoute has correct allowedRoles

### Default Access (Falling Back to 'plan')

**Cause**: User has no roles assigned in Auth0

**Solution**: Assign a role to the user in Auth0 dashboard

## Code Integration

### Checking User Role in Components

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user } = useAuth();
  
  if (user?.role === 'gym') {
    return <GymContent />;
  }
  
  if (user?.role === 'platform') {
    return <PlatformContent />;
  }
  
  return <PlanContent />;
};
```

### Protected Routes with Roles

```typescript
<ProtectedRoute allowedRoles={['gym', 'platform']}>
  <AdminDashboard />
</ProtectedRoute>
```

### Accessing Raw Auth0 Role

```typescript
const { user } = useAuth();
console.log('Auth0 role:', user?.auth0_role);
console.log('App role:', user?.role);
```

## Migration from Manual Role Selection

**Before**: Users selected role on login
**After**: Roles managed in Auth0, automatic on login

### For Existing Users:

1. Assign roles to all users in Auth0
2. Remove role localStorage entries
3. Test login flow
4. Update documentation

**Cleanup**: The app no longer uses `lastUserRole` localStorage key - you can remove it.

## Production Considerations

### Multi-Tenancy

To support multiple organizations:

```javascript
// In Auth0 Action
exports.onPostLogin = async (event, api) => {
  const namespace = 'https://edumanage.com';
  const organization = event.user.organization_id;
  
  // Get roles specific to organization
  const roles = (event.authorization.roles || [])
    .map(r => `${organization}:${r}`);
  
  api.idToken.setCustomClaim(`${namespace}/roles`, roles);
};
```

### Role-Based Access Control (RBAC)

Backend should also verify roles:

```python
# FastAPI example
from fastapi import HTTPException, Depends
from jose import jwt

async def verify_role(token: str, required_role: str):
    payload = jwt.decode(token, ...)
    roles = payload.get('https://edumanage.com/roles', [])
    if required_role not in roles:
        raise HTTPException(status_code=403)
```

### Audit Logging

Track role assignments:

```javascript
// In Auth0 Action (optional)
exports.onPostLogin = async (event, api) => {
  console.log(`User ${event.user.email} with roles:`, 
    event.authorization.roles);
};
```

## Additional Resources

- [Auth0 RBAC Documentation](https://auth0.com/docs/manage-users/access-control/rbac)
- [Auth0 Actions Documentation](https://auth0.com/docs/actions)
- [Custom Claims in Auth0](https://auth0.com/docs/get-started/apis/scopes/custom-claims)
- [JWT Tokens Guide](https://auth0.com/docs/get-started/tokens)

## Summary

✅ Roles now determined by Auth0 configuration
✅ Users no longer select role on login
✅ Automatic role assignment on authentication
✅ Centralized role management in Auth0
✅ Easy to add new roles or modify mapping
