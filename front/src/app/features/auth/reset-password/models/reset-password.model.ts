import { TypedControlsOf } from "../../../../utilities/typed-controls";

export interface ResetPasswordFormValue {
  tempPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type ResetPasswordForm = TypedControlsOf<ResetPasswordFormValue>;