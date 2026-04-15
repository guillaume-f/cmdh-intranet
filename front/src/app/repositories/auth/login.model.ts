import { UserDto } from "../../core/auth/user.model";

export interface LoginDto {
  token: string;
  user: UserDto
}

export interface LoginDtoRequest {
  email: string;
  password: string;
}