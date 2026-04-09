export interface LoginDtoRequest {
  email: string;
  password: string;
}

export interface LoginDto {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDto;
}

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
