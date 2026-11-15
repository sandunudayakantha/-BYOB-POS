import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Button } from '@/atomic/atm.button';
import { BeverageRecipeModal } from './beverage-recipe-modal.component';
import { BarDispenseRulesModal } from '@/app/components/inventory/bar-dispense-rules-modal.component';
import { ProductFormModal } from '@/app/components/products/product-form-modal.component';
import { useBarDispenseRulesUseCase } from '@/app/domain/inventory/use-bar-rules.use-case';
import { useCategoriesUseCase } from '@/app/domain/products/use-categories.use-case';
import { useCreateProductUseCase } from '@/app/domain/products/use-create-product.use-case';
import { useUpdateProductUseCase } from '@/app/domain/products/use-update-product.use-case';
import { useDeleteProductUseCase } from '@/app/domain/products/use-delete-product.use-case';
import { extractValidationErrors } from '@/utils/errors';
import toast from 'react-hot-toast';
import type { ProductModel } from '@/app/models/product.model';
import type { InventoryItemModel } from '@/app/models/inventory.model';
import {
  BeakerIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  BookOpenIcon,
  CheckCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export interface BarBeveragesTabProps {
  branchId: string;
}

export const BarBeveragesTab: React.FC<BarBeveragesTabProps> = ({ branchId }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProductForRecipe, setSelectedProductForRecipe] = useState<ProductModel | null>(null);
  const [isBarRulesModalOpen, setIsBarRulesModalOpen] = useState(false);

  // Add / Edit Beverage Modal State
  const [isBeverageModalOpen, setIsBeverageModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductModel | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    prepTime: '2-5 mins',
    image: '',
    available: true,
  });

  // Queries
  const { categories } = useCategoriesUseCase({ branchId });
  const {
    rules: barRules,
    createRule,
    updateRule,
    deleteRule,
    isCreating,
    isUpdating,
  } = useBarDispenseRulesUseCase(branchId);

  // Mutations
  const { createProduct, isSubmitting: isCreatingProduct } = useCreateProductUseCase(branchId);
  const { updateProduct, isSubmitting: isUpdatingProduct } = useUpdateProductUseCase(branchId);
  const { deleteProduct } = useDeleteProductUseCase(branchId);

  // Fetch products
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['branchProductsAll', branchId],
    queryFn: async () => {
      const res = await api.get('/products', { params: { branchId, limit: 100 } });
      return res.data?.data || res.data || [];
    },
    enabled: Boolean(branchId),
  });

  // Fetch inventory items for recipe modal & bar rules
  const { data: inventoryItems = [] } = useQuery<InventoryItemModel[]>({
    queryKey: ['inventoryItems', branchId],
    queryFn: async () => {
      const res = await api.get('/inventory/items', { params: { branchId } });
      return res.data || [];
    },
    enabled: Boolean(branchId),
  });

  const products: ProductModel[] = useMemo(() => {
    return Array.isArray(productsData) ? productsData : [];
  }, [productsData]);

  // Identify beverage categories (categories named Beverage, Drinks, Cocktails, Mocktails, Bar, Coffee, Tea, Beer, Wine, Brews)
  const beverageCategoryIds = useMemo(() => {
    return new Set(
      categories
        .filter((c) => {
          const name = c.name.toLowerCase();
          return (
            name.includes('beverage') ||
            name.includes('drink') ||
            name.includes('cocktail') ||
            name.includes('mocktail') ||
            name.includes('bar') ||
            name.includes('juice') ||
            name.includes('coffee') ||
            name.includes('tea') ||
            name.includes('spirit') ||
            name.includes('liquor') ||
            name.includes('soda') ||
            name.includes('brew') ||
            name.includes('wine') ||
            name.includes('beer') ||
            name.includes('shake') ||
            name.includes('smoothie')
          );
        })
        .map((c) => String(c.id || (c as any)._id))
    );
  }, [categories]);

  // Filter products that are beverages
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const catId = String(p.categoryId || (p as any).category_id || '');

      // Search match
      const matchesSearch =
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter:
      // If user selected a specific category tab, match that category directly.
      if (selectedCategory !== 'ALL') {
        return catId === selectedCategory && matchesSearch;
      }

      // If viewing ALL, show items belonging to detected beverage categories,
      // or if no beverage categories exist in system, show all.
      const isBeverageCategory = beverageCategoryIds.size === 0 || beverageCategoryIds.has(catId);
      return isBeverageCategory && matchesSearch;
    });
  }, [products, beverageCategoryIds, searchTerm, selectedCategory]);

  const handleOpenAddBeverage = (prod: ProductModel | null = null) => {
    setImageFile(null);
    setFieldErrors({});
    if (prod) {
      setEditingProduct(prod);
      setFormData({
        name: prod.name,
        categoryId: prod.categoryId || (prod as any).category_id || '',
        description: prod.description || '',
        prepTime: prod.prepTime || '2-5 mins',
        image: prod.imageUrl || prod.image || '',
        available: prod.available,
      });
      setImagePreview(prod.imageUrl || prod.image || '');
    } else {
      setEditingProduct(null);
      // Pre-select category: if a specific category is selected, use it.
      // Else find the first beverage category, or fallback to first category.
      let initialCat = '';
      if (selectedCategory !== 'ALL') {
        initialCat = selectedCategory;
      } else {
        const firstBevCat = categories.find((c) => beverageCategoryIds.has(String(c.id || (c as any)._id)));
        initialCat = String(firstBevCat?.id || (firstBevCat as any)?._id || categories[0]?.id || (categories[0] as any)?._id || '');
      }

      setFormData({
        name: '',
        categoryId: initialCat,
        description: '',
        prepTime: '2-5 mins',
        image: '',
        available: true,
      });
      setImagePreview('');
    }
    setIsBeverageModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBeverageModalOpen(false);
    setEditingProduct(null);
    setFieldErrors({});
    setImageFile(null);
    setImagePreview('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
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
        toast.success('Beverage updated!');
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
        toast.success('Beverage added to catalog!');
      }
      queryClient.invalidateQueries({ queryKey: ['branchProductsAll', branchId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['ownerProducts'] });
      handleCloseModal();
    } catch (err: any) {
      const valErrors = extractValidationErrors(err);
      if (Object.keys(valErrors).length > 0) {
        setFieldErrors(valErrors);
        toast.error('Please fix the errors shown below.');
      } else {
        toast.error(err?.message || 'Failed to save beverage.');
      }
    }
  };

  const handleDeleteProduct = async (prod: ProductModel) => {
    if (!window.confirm(`Delete ${prod.name}?`)) return;
    try {
      await deleteProduct({ productId: prod.id });
      toast.success('Beverage deleted.');
      queryClient.invalidateQueries({ queryKey: ['branchProductsAll', branchId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['ownerProducts'] });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete beverage.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Bar Rules Callout */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-amber-500/5 border border-amber-300/40 dark:border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-500">
              <BeakerIcon className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-extrabold text-stone-900 dark:text-white">
              Bar & Mixology Recipe Studio
            </h3>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 max-w-2xl">
            Separate recipe workspace for cocktails, mocktails, single/double shots, and mixers. Global Bar Dispense Rules automatically determine which bottle capacity (e.g. 1L vs 500ml) opens during POS billing.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
          <Button
            type="button"
            variant="secondary"
            rounded="full"
            onClick={() => setIsBarRulesModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 font-bold text-xs"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4 stroke-[2.5]" />
            <span>Global Bottle Opening Rules ({barRules.length})</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            rounded="full"
            onClick={() => handleOpenAddBeverage(null)}
            className="flex items-center gap-2 px-4 py-2.5 font-bold text-xs shadow-none"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            <span>Add Beverage / Drink</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === 'ALL'
                ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            All Beverages ({filteredProducts.length})
          </button>
          {categories
            .filter((c) => beverageCategoryIds.size === 0 || beverageCategoryIds.has(String(c.id || (c as any)._id)))
            .map((cat) => {
              const catId = String(cat.id || (cat as any)._id);
              const isSelected = selectedCategory === catId;
              return (
                <button
                  key={catId}
                  type="button"
                  onClick={() => setSelectedCategory(catId)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search cocktails, mocktails, shots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Drinks Table Container */}
      {isProductsLoading ? (
        <div className="p-12 text-center text-xs text-stone-400">Loading beverage items...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-stone-50 dark:bg-stone-900/40 rounded-3xl border border-dashed border-stone-300 dark:border-stone-800 text-stone-400 text-xs space-y-3">
          <BeakerIcon className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto" />
          <div className="space-y-1">
            <p className="font-bold text-stone-700 dark:text-stone-300 text-sm">No beverage items found</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Add drinks in categories like "Mocktails", "Cocktails", or "Bar Drinks" to manage their recipes and bottle dispense rules.
            </p>
          </div>
          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              rounded="full"
              onClick={() => handleOpenAddBeverage(null)}
              className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-xs shadow-none"
            >
              <PlusIcon className="w-4 h-4 stroke-[2.5]" />
              <span>Add Your First Beverage</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-stone-200/80 dark:border-white/[0.07] bg-white/75 dark:bg-stone-900/40 backdrop-blur-xl shadow-xl shadow-black/5">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100/80 dark:bg-stone-950/80 border-b border-stone-200/80 dark:border-white/[0.06] text-stone-600 dark:text-stone-300 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Beverage / Drink</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Selling Price</th>
                <th className="py-3.5 px-4 text-center">Mixology Recipe</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/[0.05]">
              {filteredProducts.map((product) => {
                const cat = categories.find((c) => String(c.id || (c as any)._id) === String(product.categoryId || (product as any).category_id));
                const price = Number(product.price || (product as any).selling_price || 0);

                return (
                  <tr
                    key={product.id || (product as any)._id}
                    className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20 font-bold">
                          {product.imageUrl || product.image ? (
                            <img
                              src={product.imageUrl || product.image}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            '🍹'
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 dark:text-white block group-hover:text-amber-500 transition">
                            {product.name}
                          </span>
                          <span className="text-[11px] text-stone-400 line-clamp-1">
                            {product.description || 'Bar signature drink'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                        {cat?.name || 'Beverage'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-extrabold text-stone-900 dark:text-white">
                      Rs. {price.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                        {product.recipeItemCount && product.recipeItemCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-bold bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            {product.recipeItemCount} Pour Ingredients
                          </span>
                        ) : (
                          <span className="text-stone-400">No recipe defined</span>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          rounded="full"
                          onClick={() => setSelectedProductForRecipe(product)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                        >
                          <BookOpenIcon className="w-3.5 h-3.5" />
                          <span>Mixology Recipe</span>
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleOpenAddBeverage(product)}
                          className="w-7 h-7 flex items-center justify-center rounded-full border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition shrink-0"
                          title="Edit Beverage Details"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product)}
                          className="w-7 h-7 flex items-center justify-center rounded-full border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
                          title="Delete Beverage"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Global Bar Dispense Rules Modal */}
      {isBarRulesModalOpen && (
        <BarDispenseRulesModal
          isOpen={isBarRulesModalOpen}
          branchId={branchId}
          rules={barRules}
          inventoryItems={inventoryItems}
          onClose={() => setIsBarRulesModalOpen(false)}
          onCreateRule={createRule}
          onUpdateRule={updateRule}
          onDeleteRule={deleteRule}
          isCreating={isCreating}
          isUpdating={isUpdating}
        />
      )}

      {/* Dedicated Beverage Recipe Modal */}
      {selectedProductForRecipe && (
        <BeverageRecipeModal
          isOpen={Boolean(selectedProductForRecipe)}
          onClose={() => setSelectedProductForRecipe(null)}
          product={selectedProductForRecipe}
          branchId={branchId}
          inventoryItems={inventoryItems}
          barRules={barRules}
        />
      )}

      {/* Product Form Modal (Add / Edit Beverage) */}
      {isBeverageModalOpen && (
        <ProductFormModal
          title={editingProduct ? 'Edit Beverage' : 'Add New Beverage / Drink'}
          namePlaceholder="e.g. Classic Mojito, Old Fashioned, Iced Americano"
          isOpen={isBeverageModalOpen}
          onClose={handleCloseModal}
          editingProduct={editingProduct}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          imageFile={imageFile}
          setImageFile={setImageFile}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          handleFileChange={handleFileChange}
          errors={fieldErrors}
          setErrors={setFieldErrors}
          onSubmit={handleSubmit}
          isSubmitting={isCreatingProduct || isUpdatingProduct}
        />
      )}
    </div>
  );
};
