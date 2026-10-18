export interface QRCodeModel {
  id: string;
  _id?: string;
  token: string;
  branchId: string;
  menuId?: string;
  tableName?: string;
  isActive: boolean;
  menu?: {
    _id?: string;
    id?: string;
    name?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
