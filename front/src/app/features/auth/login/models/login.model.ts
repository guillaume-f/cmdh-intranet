import { TypedControlsOf } from "../../../../utilities/typed-controls";

export interface LoginFormValue {
  email: string;
  password: string;
}

export type LoginForm = TypedControlsOf<LoginFormValue>;