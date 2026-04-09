import { TypedControlsOf } from "../../../../utilities/typed-controls";

export interface ForgotPasswordFormValue {
  email: string;
}

export type ForgotPasswordForm = TypedControlsOf<ForgotPasswordFormValue>;