import type { RestaurantModel, PlatformStatsModel } from "@/app/models/restaurant.model";

export interface RestaurantDto {
  id?: string;
  _id?: string;
  name: string;
  owner_name?: string;
  ownerName?: string;
  owner_email?: string;
  ownerEmail?: string;
  max_branches?: number;
  maxBranches?: number;
  branches_count?: number;
  branchesCount?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PlatformStatsDto {
  total_restaurants?: number;
  totalRestaurants?: number;
  total_branches?: number;
  totalBranches?: number;
  total_products?: number;
  totalProducts?: number;
  total_menus?: number;
  totalMenus?: number;
  total_qr_codes?: number;
  totalQRCodes?: number;
  active_restaurants?: number;
  activeRestaurants?: number;
  suspended_restaurants?: number;
  suspendedRestaurants?: number;
}

export interface CreateRestaurantRequestDto {
  name: string;
  owner_name: string;
  owner_email: string;
  owner_password?: string;
  max_branches: number;
}

export interface UpdateRestaurantStatusRequestDto {
  status: string;
}

export interface UpdateBranchLimitRequestDto {
  max_branches: number;
}

export interface ResetRestaurantPasswordRequestDto {
  new_password?: string;
  newPassword?: string;
}

export function mapRestaurantDtoToModel(dto: RestaurantDto): RestaurantModel {
  const resolvedId = String(dto.id || dto._id || '');
  return {
    id: resolvedId,
    _id: resolvedId,
    name: dto.name,
    ownerName: dto.owner_name || dto.ownerName || undefined,
    ownerEmail: dto.owner_email || dto.ownerEmail || undefined,
    maxBranches: Number(dto.max_branches ?? dto.maxBranches ?? 3),
    branchesCount: Number(dto.branches_count ?? dto.branchesCount ?? 0),
    status: (dto.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE') as 'ACTIVE' | 'SUSPENDED',
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapPlatformStatsDtoToModel(dto: PlatformStatsDto): PlatformStatsModel {
  return {
    totalRestaurants: dto.total_restaurants ?? dto.totalRestaurants ?? 0,
    totalBranches: dto.total_branches ?? dto.totalBranches ?? 0,
    totalProducts: dto.total_products ?? dto.totalProducts ?? 0,
    totalMenus: dto.total_menus ?? dto.totalMenus ?? 0,
    totalQRCodes: dto.total_qr_codes ?? dto.totalQRCodes ?? 0,
    activeRestaurants: dto.active_restaurants ?? dto.activeRestaurants ?? 0,
    suspendedRestaurants: dto.suspended_restaurants ?? dto.suspendedRestaurants ?? 0,
  };
}

export function mapCreateRestaurantInputToDto(input: {
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword?: string;
  maxBranches?: number;
}): CreateRestaurantRequestDto {
  return {
    name: input.name.trim(),
    owner_name: input.ownerName.trim(),
    owner_email: input.ownerEmail.trim().toLowerCase(),
    owner_password: input.ownerPassword,
    max_branches: Number(input.maxBranches ?? 3),
  };
}

export function mapUpdateRestaurantStatusInputToDto(input: {
  status: string;
}): UpdateRestaurantStatusRequestDto {
  return {
    status: input.status,
  };
}

export function mapUpdateBranchLimitInputToDto(input: {
  maxBranches: number;
}): UpdateBranchLimitRequestDto {
  return {
    max_branches: Number(input.maxBranches),
  };
}

export function mapResetPasswordInputToDto(input: {
  newPassword: string;
}): ResetRestaurantPasswordRequestDto {
  return {
    newPassword: input.newPassword,
  };
}
