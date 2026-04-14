import { Permission } from "./permissions.type"
import { UserRole } from "./user-role.type"

export interface Role {
  id: UserRole
  label: string
  permissions: Permission[]
}