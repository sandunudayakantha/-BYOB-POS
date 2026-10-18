import React, { useState, useMemo } from 'react';
import { useBranch } from '@/contexts/BranchContext';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useProductsUseCase } from '@/app/domain/products/use-products.use-case';
import { useCreateProductUseCase } from '@/app/domain/products/use-create-product.use-case';
import { useUpdateProductUseCase } from '@/app/domain/products/use-update-product.use-case';
import { useDeleteProductUseCase } from '@/app/domain/products/use-delete-product.use-case';
import { ProductViewModal } from '@/app/components/products/product-view-modal.component';
import { ProductFeatureModal } from '@/app/components/products/product-feature-modal.component';
import { ProductFormModal } from '@/app/components/products/product-form-modal.component';
import { ProductRecipeModal } from '@/app/components/products/product-recipe-modal.component';
import { buildProductColumns } from '@/app/components/products/product-table-columns';
import { DataTable } from '@/atomic/obj.data-table';
import api from '@/services/api';
import toast from 'react-hot-toast';
import type { ProductModel } from '@/app/models/product.model';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export interface ProductsPageProps {
  embedded?: boolean;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ embedded = false }) => {
  const queryClient = useQueryClient();
  const { activeBranch } = useBranch();
  const branchId = String(activeBranch?._id || activeBranch?.id || '');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);

  // Selected item states
  const [editingProduct, setEditingProduct] = useState<ProductModel | null>(null);
  const [viewingProduct, setViewingProduct] = useState<ProductModel | null>(null);
  const [featuringProduct, setFeaturingProduct] = useState<ProductModel | null>(null);
  const [recipeProduct, setRecipeProduct] = useState<ProductModel | null>(null);

  // Pagination & Filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 10;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    prepTime: '15-20 mins',
    image: '',
    available: true,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['ownerCategories', branchId],
    queryFn: async () => {
      const res = await api.get('/categories', { params: { branchId } });
      return res.data || [];
    },
    enabled: Boolean(branchId),
  });

  const { data: featuredSections = [] } = useQuery({
    queryKey: ['featuredSections', branchId],
    queryFn: async () => {
      const res = await api.get('/featured', { params: { branchId } });
      return res.data || [];
    },
    enabled: Boolean(branchId),
  });

  const { products, meta, isLoading } = useProductsUseCase({
    branchId,
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
  });

  const { createProduct, isSubmitting: isCreating } = useCreateProductUseCase();
  const { updateProduct, isSubmitting: isUpdating } = useUpdateProductUseCase();
  const { deleteProduct } = useDeleteProductUseCase();

  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ sectionId, productIds }: { sectionId: string; productIds: any[] }) => {
      return api.put(`/featured/${sectionId}`, { products: productIds });
    },
    onSuccess: () => {
      toast.success('Featured status updated!');
      queryClient.invalidateQueries({ queryKey: ['featuredSections', branchId] });
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to update featured banner.'),
  });

  const handleOpenEdit = (prod: ProductModel | null = null) => {
    setImageFile(null);
    if (prod) {
      setEditingProduct(prod);
      setFormData({
        name: prod.name,
        categoryId: prod.categoryId || (prod as any).category?._id || '',
        description: prod.description || '',
        prepTime: prod.prepTime || '15-20 mins',
        image: prod.imageUrl || prod.image || '',
        available: prod.available,
      });
      setImagePreview(prod.imageUrl || prod.image || '');
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        categoryId: categories[0]?._id || '',
        description: '',
        prepTime: '15-20 mins',
        image: '',
        available: true,
      });
      setImagePreview('');
    }
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setViewModalOpen(false);
    setFeatureModalOpen(false);
    setEditingProduct(null);
    setViewingProduct(null);
    setFeaturingProduct(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct({
          productId: editingProduct.id,
          name: formData.name,
          categoryId: formData.categoryId,
          description: formData.description,
          prepTime: formData.prepTime,
          available: formData.available,
          imageFile: imageFile || undefined,
          imageUrl: !imageFile && formData.image ? formData.image : undefined,
        });
        toast.success('Product updated!');
      } else {
        await createProduct({
          branchId,
          name: formData.name,
          categoryId: formData.categoryId,
          description: formData.description,
          prepTime: formData.prepTime,
          available: formData.available,
          imageFile: imageFile || undefined,
          imageUrl: !imageFile && formData.image ? formData.image : undefined,
        });
        toast.success('Product added to catalog!');
      }
      queryClient.invalidateQueries({ queryKey: ['ownerProducts'] });
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save product.');
    }
  };

  const handleDelete = async (prod: ProductModel) => {
    if (!window.confirm(`Delete ${prod.name}?`)) return;
    try {
      await deleteProduct({ productId: prod.id });
      toast.success('Product deleted.');
      queryClient.invalidateQueries({ queryKey: ['ownerProducts'] });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete product.');
    }
  };

  const columns = useMemo(() => {
    return buildProductColumns({
      featuredSections,
      onView: (p) => {
        setViewingProduct(p);
        setViewModalOpen(true);
      },
      onRecipe: (p) => {
        setRecipeProduct(p);
        setRecipeModalOpen(true);
      },
      onFeature: (p) => {
        setFeaturingProduct(p);
        setFeatureModalOpen(true);
      },
      onEdit: (p) => handleOpenEdit(p),
      onDelete: (p) => handleDelete(p),
    });
  }, [featuredSections, categories]);

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Menu Products ({activeBranch?.name})
            </h2>
            <p className="text-sm text-slate-500">Manage dishes, pricing, preparation standards, and recipes.</p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenEdit(null)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Add Product
          </button>
        </div>
      )}

      {embedded && (
        <div className="flex justify-between items-center gap-4">
          <p className="text-xs font-semibold text-slate-500">Catalog inventory items for {activeBranch?.name}.</p>
          <button
            type="button"
            onClick={() => handleOpenEdit(null)}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition"
          >
            <PlusIcon className="w-4 h-4" />
            Add Product
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full max-w-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <DataTable
        columns={columns}
        data={products}
        keyExtractor={(item) => String(item.id)}
        isLoading={isLoading}
        emptyMessage="No products found in catalog."
      />

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, meta.total)} of {meta.total} products
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {currentPage} / {meta.totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= meta.totalPages}
              onClick={() => setCurrentPage((p) => Math.min(meta.totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductFormModal
        isOpen={modalOpen}
        onClose={handleClose}
        editingProduct={editingProduct}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        imageFile={imageFile}
        setImageFile={setImageFile}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        handleFileChange={handleFileChange}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />
      <ProductViewModal
        isOpen={viewModalOpen}
        onClose={handleClose}
        product={viewingProduct}
        featuredSections={featuredSections}
        onOpenFeature={(p) => {
          setFeaturingProduct(p);
          setFeatureModalOpen(true);
        }}
        onOpenEdit={(p) => handleOpenEdit(p)}
      />
      <ProductFeatureModal
        isOpen={featureModalOpen}
        onClose={handleClose}
        product={featuringProduct}
        featuredSections={featuredSections}
        onToggleFeature={(secId, ids) => toggleFeatureMutation.mutate({ sectionId: secId, productIds: ids })}
      />
      {recipeModalOpen && recipeProduct && (
        <ProductRecipeModal
          isOpen={recipeModalOpen}
          onClose={() => {
            setRecipeModalOpen(false);
            setRecipeProduct(null);
          }}
          product={recipeProduct}
          branchId={branchId}
        />
      )}
    </div>
  );
};

export default ProductsPage;
