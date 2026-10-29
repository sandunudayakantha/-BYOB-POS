import React, { useState, useMemo } from 'react';
import { useBranch } from '@/contexts/BranchContext';
import { useCategoriesUseCase } from '@/app/domain/products/use-categories.use-case';
import { useCreateCategoryUseCase } from '@/app/domain/products/use-create-category.use-case';
import { useUpdateCategoryUseCase } from '@/app/domain/products/use-update-category.use-case';
import { useDeleteCategoryUseCase } from '@/app/domain/products/use-delete-category.use-case';
import { buildCategoryColumns } from '@/app/components/categories/category-table-columns';
import { CategoryFormModal } from '@/app/components/categories/category-form-modal.component';
import { DataTable } from '@/atomic/obj.data-table';
import { Button } from '@/atomic/atm.button';
import toast from 'react-hot-toast';
import type { CategoryModel } from '@/app/models/product.model';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export interface CategoriesPageProps {
  embedded?: boolean;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ embedded = false }) => {
  const { activeBranch } = useBranch();
  const branchId = String(activeBranch?._id || activeBranch?.id || '');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryModel | null>(null);
  const [formData, setFormData] = useState({ name: '', sortOrder: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const { categories, isLoading } = useCategoriesUseCase({ branchId });
  const { createCategory, isSubmitting: isCreating } = useCreateCategoryUseCase();
  const { updateCategory, isSubmitting: isUpdating } = useUpdateCategoryUseCase();
  const { deleteCategory } = useDeleteCategoryUseCase();

  const handleOpen = (cat: CategoryModel | null = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({ name: cat.name, sortOrder: cat.displayOrder ?? 0 });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', sortOrder: 0 });
    }
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory({
          categoryId: editingCategory.id,
          name: formData.name,
          sortOrder: formData.sortOrder,
        });
        toast.success('Category updated!');
      } else {
        await createCategory({
          branchId,
          name: formData.name,
          sortOrder: formData.sortOrder,
        });
        toast.success('Category created!');
      }
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save category.');
    }
  };

  const handleDelete = async (cat: CategoryModel) => {
    if (!window.confirm(`Delete ${cat.name}?`)) return;
    try {
      await deleteCategory({ categoryId: cat.id });
      toast.success('Category deleted.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete category.');
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [categories, searchTerm]);

  const columns = useMemo(() => {
    return buildCategoryColumns({
      onEdit: (cat) => handleOpen(cat),
      onDelete: (cat) => handleDelete(cat),
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {!embedded && (
            <>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Menu Categories ({activeBranch?.name})
              </h2>
              <p className="text-sm text-slate-500">
                Organize products into groups for customer navigation.
              </p>
            </>
          )}
          {embedded && (
            <p className="text-xs font-semibold text-slate-500">
              Customer navigation groups (e.g. Appetizers, Mains, Drinks) for {activeBranch?.name}.
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="primary"
          size="md"
          rounded="full"
          onClick={() => handleOpen()}
          className="flex items-center justify-center gap-2 py-2.5 px-5 font-bold text-sm shadow-none transition active:scale-95"
        >
          <PlusIcon className="w-5 h-5 stroke-[2.5]" />
          <span>Add Category</span>
        </Button>
      </div>

      <div className="relative max-w-sm w-full">
        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search categories by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredCategories}
        keyExtractor={(item) => String(item.id)}
        isLoading={isLoading}
        emptyMessage="No categories created yet."
      />

      <CategoryFormModal
        isOpen={modalOpen}
        onClose={handleClose}
        editingCategory={editingCategory}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
};

export default CategoriesPage;
