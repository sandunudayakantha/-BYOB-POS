import { apiClient } from "@/app/core/http/api-client";
import { mapProductDtoToModel, type ProductDto } from "./products.dto";
import type { ProductModel } from "@/app/models/product.model";

export interface UpdateProductMutationInput {
  productId: string;
  name: string;
  categoryId: string;
  description?: string;
  prepTime?: string;
  available: boolean;
  imageFile?: File;
  imageUrl?: string;
}

export async function updateProductMutation(input: UpdateProductMutationInput): Promise<ProductModel> {
  const formData = new FormData();
  formData.append("name", input.name);
  formData.append("categoryId", input.categoryId);
  formData.append("available", String(input.available));
  if (input.description) formData.append("description", input.description);
  if (input.prepTime) formData.append("prepTime", input.prepTime);

  if (input.imageFile) {
    formData.append("image", input.imageFile);
  } else if (input.imageUrl) {
    formData.append("image", input.imageUrl);
  }

  const response = await apiClient.put<{ data: ProductDto }>(`/products/${input.productId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return mapProductDtoToModel(response.data?.data);
}
