export type AuthRole = 'admin' | 'client'

export function getRoleHomePath(role: AuthRole | null | undefined) {
  switch (role) {
    case 'admin':
      return '/dashboard'
    case 'client':
      return '/cabinet'
    default:
      return null
  }
}

export function isAuthRole(role: string | null | undefined): role is AuthRole {
  return role === 'admin' || role === 'client'
}
