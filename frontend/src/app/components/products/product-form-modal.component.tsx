import React from 'react';
import Modal from '@/components/Modal';
import { FormInput, FormSelect, FormTextarea } from '@/components/FormFields';
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
          onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <FormSelect
          label="Category"
          value={formData.categoryId}
          onChange={(e: any) => setFormData({ ...formData, categoryId: e.target.value })}
          options={categories.map((c) => ({ value: c._id, label: c.name }))}
          required
        />

        <FormTextarea
          label="Description"
          placeholder="Detailed description of ingredients and flavors..."
          value={formData.description}
          onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
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
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-md flex-shrink-0"
                />
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {imageFile ? imageFile.name : 'Current Image'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {imageFile ? `${(imageFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Cloudinary Hosted Image'}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <label className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 cursor-pointer transition">
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
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-500 text-[11px] font-bold hover:bg-rose-500/20 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                  <PhotoIcon className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Upload image file via Cloudinary
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG or WEBP (Max 5MB)</p>
                <label className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer transition shadow-md">
                  <PhotoIcon className="w-4 h-4" /> Browse Image File
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
              <p className="text-[10px] text-slate-400 font-medium mb-1">Or paste direct image URL:</p>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={(e) => {
                  setFormData({ ...formData, image: e.target.value });
                  if (!imageFile) setImagePreview(e.target.value);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
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
            className="w-5 h-5 accent-emerald-600 rounded"
          />
          <label htmlFor="available" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Product is Available for Ordering
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition"
        >
          {isSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add to Catalog'}
        </button>
      </form>
    </Modal>
  );
};
