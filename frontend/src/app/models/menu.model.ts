export interface MenuItemModel {
  id: string;
  _id?: string;
  menuId: string;
  productId: string;
  productName?: string;
  categoryId?: string;
  categoryName?: string;
  price: number;
  isAvailable: boolean;
  displayOrder?: number;
}

export interface MenuModel {
  id: string;
  _id?: string;
  branchId: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  isBaseMenu: boolean;
  itemCount?: number;
  items?: MenuItemModel[];
  createdAt?: string;
  updatedAt?: string;
}
