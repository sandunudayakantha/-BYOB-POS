export interface ProductModel {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  image?: string;
  categoryId: string;
  categoryName?: string;
  branchId: string;
  available: boolean;
  prepTime?: string;
  recipeItemCount?: number;
  featuredSectionIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryModel {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  branchId: string;
  isActive: boolean;
  displayOrder?: number;
}

export interface RecipeItemModel {
  id?: string;
  productId: string;
  rawItemId?: number;
  prepDefinitionId?: number;
  quantityRequired: number;
  uomSymbol?: string;
  name?: string;
}
