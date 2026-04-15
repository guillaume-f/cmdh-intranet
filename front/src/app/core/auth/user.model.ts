import { Permission } from "./permissions.type"
import { UserRole } from "./user-role.type"

export interface UserDto {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  extraPermissions: Permission[]
  deniedPermissions: Permission[]
  permissions: Permission[]
  active: boolean
}