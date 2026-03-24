export type UserRole = 'candidate' | 'member' | 'encoder' | 'admin'

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  candidate: 0,
  member: 1,
  encoder: 2,
  admin: 3,
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatar: string | null
  active: boolean
}

export interface AuthResponse {
  token: string
  user: User
}