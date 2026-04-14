import { Permission } from "./permissions.type"
import { UserRole } from "./user-role.type"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  extraPermissions: Permission[]
  deniedPermissions: Permission[]
  permissions: Permission[]   // ← permissions effectives calculées par l'API
  avatar: string | null
  active: boolean
}