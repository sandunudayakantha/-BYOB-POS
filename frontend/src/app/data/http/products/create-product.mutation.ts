import { apiClient } from "@/app/core/http/api-client";
import { mapProductDtoToModel, type ProductDto } from "./products.dto";
import type { ProductModel } from "@/app/models/product.model";

export interface CreateProductMutationInput {
  branchId: string;
  name: string;
  categoryId: string;
  description?: string;
  prepTime?: string;
  available: boolean;
  imageFile?: File;
  imageUrl?: string;
}

export async function createProductMutation(input: CreateProductMutationInput): Promise<ProductModel> {
  const formData = new FormData();
  formData.append("name", input.name);
  formData.append("categoryId", input.categoryId);
  formData.append("branchId", input.branchId);
  formData.append("available", String(input.available));
  if (input.description) formData.append("description", input.description);
  if (input.prepTime) formData.append("prepTime", input.prepTime);

  if (input.imageFile) {
    formData.append("image", input.imageFile);
  } else if (input.imageUrl) {
    formData.append("image", input.imageUrl);
  }

  const response = await apiClient.post<{ data: ProductDto }>("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return mapProductDtoToModel(response.data?.data);
}
