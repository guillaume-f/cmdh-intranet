import { UserRole } from '../../core/auth/user-role.type';

export interface UserDtoRequest {
  firstName: string;
  lastName: string;
  email: string;
  niss: string;
  entryYear?: number | null;
  role: UserRole;
  active: boolean;
}
