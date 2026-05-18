import { UserRole } from '../../../../core/auth/user-role.type';
import { TypedControlsOf } from '../../../../utilities/typed-controls';

export interface UserEditFormValue {
  firstName: string;
  lastName: string;
  email: string;
  niss: string;
  entryYear?: number | null;
  role: UserRole;
  active: boolean;
}

export type UserEditForm = TypedControlsOf<UserEditFormValue>;
