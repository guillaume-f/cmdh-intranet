import { TypedControlsOf } from '../../utilities/typed-controls';

export interface ProfilePasswordFormValue {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type ProfilePasswordForm = TypedControlsOf<ProfilePasswordFormValue>;
