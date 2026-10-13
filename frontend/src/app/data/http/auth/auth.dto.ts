import type { UserModel, AuthTokensModel } from "@/app/models/user.model";

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'RESTAURANT_OWNER' | 'STAFF';
  restaurant_id?: string;
  branch_id?: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  access_token: string;
  refresh_token?: string;
  user: UserDto;
}

export interface RefreshResponseDto {
  access_token: string;
  refresh_token?: string;
}

export function mapLoginInputToDto(input: { email: string; password: string }): LoginRequestDto {
  return {
    email: input.email.trim().toLowerCase(),
    password: input.password,
  };
}

export function mapUserDtoToModel(dto: UserDto): UserModel {
  return {
    id: dto.id,
    _id: dto.id,
    name: dto.name,
    email: dto.email,
    role: dto.role,
    restaurantId: dto.restaurant_id,
    restaurant_id: dto.restaurant_id,
    branchId: dto.branch_id,
    branch_id: dto.branch_id,
  };
}

export function mapLoginResponseDtoToModel(dto: LoginResponseDto): AuthTokensModel {
  return {
    accessToken: dto.access_token,
    refreshToken: dto.refresh_token,
    user: mapUserDtoToModel(dto.user),
  };
}
