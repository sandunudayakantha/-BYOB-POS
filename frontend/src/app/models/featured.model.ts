export interface FeaturedSectionModel {
  id: string;
  _id?: string;
  branchId: string;
  title: string;
  description?: string;
  products: (number | string)[];
  productDetails?: any[];
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
