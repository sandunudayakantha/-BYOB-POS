import React from 'react';
import Modal from '@/components/Modal';
import { FormInput, FormSelect, FormTextarea } from '@/components/FormFields';
import { Button } from '@/atomic/atm.button';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: any;
  formData: {
    name: string;
    categoryId: string;
    description: string;
    prepTime: string;
    image: string;
    available: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  categories: any[];
  imageFile: File | null;
  setImageFile: (f: File | null) => void;
  imagePreview: string;
  setImagePreview: (url: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: Record<string, string>;
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  editingProduct,
  formData,
  setFormData,
  categories,
  imageFile,
  setImageFile,
  imagePreview,
  setImagePreview,
  handleFileChange,
  errors = {},
  setErrors,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingProduct ? 'Edit Product' : 'Add Product to Catalog'}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormInput
          label="Product Name"
          placeholder="e.g. Truffle Wagyu Burger"
          value={formData.name}
          error={errors.name}
          onChange={(e: any) => {
            setFormData({ ...formData, name: e.target.value });
            if (setErrors && errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          required
        />

        <FormSelect
          label="Category"
          value={formData.categoryId}
          error={errors.categoryId || errors.category_id}
          onChange={(e: any) => {
            setFormData({ ...formData, categoryId: e.target.value });
            if (setErrors && (errors.categoryId || errors.category_id)) {
              setErrors((prev) => ({ ...prev, categoryId: '', category_id: '' }));
            }
          }}
          options={categories.map((c) => ({ value: c._id, label: c.name }))}
          required
        />

        <FormTextarea
          label="Description"
          placeholder="Detailed description of ingredients and flavors..."
          value={formData.description}
          error={errors.description}
          onChange={(e: any) => {
            setFormData({ ...formData, description: e.target.value });
            if (setErrors && errors.description) setErrors((prev) => ({ ...prev, description: '' }));
          }}
        />

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Product Image (Cloudinary)
          </label>

          <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
            {imagePreview ? (
              <div className="flex items-center gap-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-amber-500/40 shadow-md flex-shrink-0"
                />
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="text-xs font-bold text-stone-900 dark:text-white truncate">
                    {imageFile ? imageFile.name : 'Current Image'}
                  </p>
                  <p className="text-[10px] text-stone-400">
                    {imageFile ? `${(imageFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Cloudinary Hosted Image'}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <label className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] font-bold cursor-pointer transition shadow-sm">
                      Change File
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                        setFormData({ ...formData, image: '' });
                      }}
                      className="px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-500 text-[11px] font-bold hover:bg-rose-500/20 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center mb-2 border border-amber-500/20">
                  <PhotoIcon className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-stone-700 dark:text-stone-200">
                  Upload image file via Cloudinary
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">PNG, JPG or WEBP (Max 5MB)</p>
                <label className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold cursor-pointer transition shadow-none active:scale-95">
                  <PhotoIcon className="w-4 h-4" /> Browse Image File
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            )}

            <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
              <p className="text-[10px] text-stone-400 font-medium mb-1">Or paste direct image URL:</p>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={(e) => {
                  setFormData({ ...formData, image: e.target.value });
                  if (!imageFile) setImagePreview(e.target.value);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <FormInput
          label="Preparation Time"
          placeholder="e.g. 15-20 mins"
          value={formData.prepTime}
          onChange={(e: any) => setFormData({ ...formData, prepTime: e.target.value })}
        />

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="available"
            checked={formData.available}
            onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
            className="w-5 h-5 accent-amber-500 rounded"
          />
          <label htmlFor="available" className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            Product is Available for Ordering
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          rounded="full"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="w-full py-3 font-bold text-sm shadow-none"
        >
          {editingProduct ? 'Update Product' : 'Add to Catalog'}
        </Button>
      </form>
    </Modal>
  );
};
