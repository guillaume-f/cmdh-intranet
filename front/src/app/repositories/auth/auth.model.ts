export interface ForgotPasswordDtoRequest {
  email: string;
}

export interface ForgotPasswordDto {
  message: string;
}

export interface ResetPasswordDtoRequest {
  tempPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordDto {
  message: string;
}

export interface AuthUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface RefreshDto {
  token: string;
}
