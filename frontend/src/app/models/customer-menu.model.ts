export interface CustomerRestaurantModel {
  name: string;
  logo?: string | null;
  coverImage?: string | null;
}

export interface CustomerBranchModel {
  name: string;
  phone?: string | null;
  address?: string | null;
  coverImage?: string | null;
  logo?: string | null;
}

export interface CustomerCategoryModel {
  _id: string;
  id?: string;
  name: string;
  icon?: string | null;
}

export interface CustomerProductModel {
  _id: string;
  id?: string;
  name: string;
  description?: string | null;
  price?: number;
  image?: string | null;
}

export interface CustomerMenuItemModel {
  _id: string;
  price: number;
  product: CustomerProductModel;
}

export interface CustomerFeaturedSectionModel {
  _id: string;
  title: string;
  products: CustomerProductModel[];
}

export interface CustomerMenuResponseModel {
  restaurant?: CustomerRestaurantModel;
  branch?: CustomerBranchModel;
  menu?: { name: string; description?: string };
  tableName?: string;
  categories: CustomerCategoryModel[];
  featuredSections: CustomerFeaturedSectionModel[];
  menuItems: CustomerMenuItemModel[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
