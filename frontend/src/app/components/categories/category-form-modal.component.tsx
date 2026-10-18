import React from 'react';
import Modal from '@/components/Modal';
import { FormInput } from '@/components/FormFields';
import type { CategoryModel } from '@/app/models/product.model';

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: CategoryModel | null;
  formData: {
    name: string;
    sortOrder: number;
  };
  setFormData: React.Dispatch<React.SetStateAction<{ name: string; sortOrder: number }>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  editingCategory,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCategory ? 'Edit Category' : 'Create Category'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormInput
          label="Category Name"
          placeholder="e.g. Italian Pizzas, Gourmet Burgers"
          value={formData.name}
          onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <FormInput
          label="Display Priority Order"
          type="number"
          placeholder="0"
          value={formData.sortOrder}
          onChange={(e: any) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
        </button>
      </form>
    </Modal>
  );
};
