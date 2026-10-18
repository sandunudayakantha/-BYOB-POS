import type { QRCodeModel } from "@/app/models/qrcode.model";

export interface QRCodeDto {
  id?: string;
  _id?: string;
  token: string;
  branch_id?: string;
  branchId?: string;
  menu_id?: string;
  menuId?: string;
  table_name?: string | null;
  tableName?: string | null;
  is_active?: boolean;
  isActive?: boolean;
  menu?: {
    id?: string;
    _id?: string;
    name?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateQRCodeRequestDto {
  branch_id: string;
  menu_id?: string;
  table_name?: string;
}

export interface ToggleQRStatusRequestDto {
  is_active: boolean;
}

export function mapQRCodeDtoToModel(dto: QRCodeDto): QRCodeModel {
  const resolvedId = String(dto.id || dto._id || '');
  return {
    id: resolvedId,
    _id: resolvedId,
    token: dto.token,
    branchId: String(dto.branch_id || dto.branchId || ''),
    menuId: dto.menu_id || dto.menuId || undefined,
    tableName: dto.table_name || dto.tableName || undefined,
    isActive: Boolean(dto.is_active ?? dto.isActive ?? true),
    menu: dto.menu,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapCreateQRCodeInputToDto(input: {
  branchId: string;
  menuId?: string;
  tableName?: string;
}): CreateQRCodeRequestDto {
  return {
    branch_id: input.branchId,
    menu_id: input.menuId || undefined,
    table_name: input.tableName?.trim() || undefined,
  };
}

export function mapToggleQRStatusInputToDto(input: {
  isActive: boolean;
}): ToggleQRStatusRequestDto {
  return {
    is_active: Boolean(input.isActive),
  };
}
