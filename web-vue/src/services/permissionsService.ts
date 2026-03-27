import { Permission } from '../types/permission'

type Auth0CacheEntry = {
  decodedToken?: {
    claims?: {
      permissions?: string[]
    }
  }
  body?: {
    decodedToken?: {
      claims?: {
        permissions?: string[]
      }
    }
  }
}

export const getCurrentUserPermissions = (): Permission[] => {
  const permissions = new Set<Permission>()

  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith('@@auth0spajs@@')) {
      continue
    }

    const rawEntry = localStorage.getItem(key)

    if (!rawEntry) {
      continue
    }

    try {
      const parsedEntry = JSON.parse(rawEntry) as Auth0CacheEntry

      const claimPermissions = [
        parsedEntry.decodedToken?.claims?.permissions,
        parsedEntry.body?.decodedToken?.claims?.permissions,
      ]

      for (const permissionList of claimPermissions) {
        if (!Array.isArray(permissionList)) {
          continue
        }

        for (const permission of permissionList) {
          if (Object.values(Permission).includes(permission as Permission)) {
            permissions.add(permission as Permission)
          }
        }
      }
    } catch {
      continue
    }
  }

  return Array.from(permissions)
}

export const hasCurrentUserPermission = (permission: Permission): boolean => {
  return getCurrentUserPermissions().includes(permission)
}
