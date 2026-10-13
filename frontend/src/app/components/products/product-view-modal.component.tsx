import React from 'react';
import Modal from '@/components/Modal';
import Badge from '@/components/Badge';
import { PhotoIcon, TagIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';

interface ProductViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  featuredSections: any[];
  onOpenFeature: (product: any) => void;
  onOpenEdit: (product: any) => void;
}

export const ProductViewModal: React.FC<ProductViewModalProps> = ({
  isOpen,
  onClose,
  product,
  featuredSections,
  onOpenFeature,
  onOpenEdit,
}) => {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Showcase & Specs">
      <div className="space-y-5">
        <div className="w-full h-52 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative border border-slate-200 dark:border-slate-700">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <PhotoIcon className="w-10 h-10" />
              <span className="text-xs font-semibold">No Image Uploaded</span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge variant={product.available ? 'active' : 'inactive'}>
              {product.available ? 'Available' : 'Sold Out'}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{product.name}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.description || 'No detailed description added for this product.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <TagIcon className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Category</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {product.category?.name || 'Unassigned'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <ClockIcon className="w-5 h-5 text-indigo-500" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Prep Time</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {product.prepTime || '15-20 mins'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FireIcon className="w-4 h-4 text-amber-500" />
            Featured Banners Assignment
          </h4>
          <div className="flex flex-wrap gap-2">
            {featuredSections.filter((s) => s.products?.some((p: any) => (p._id || p) === product._id)).length === 0 ? (
              <span className="text-xs text-slate-400 italic">Not currently featured on any promotional banners.</span>
            ) : (
              featuredSections
                .filter((s) => s.products?.some((p: any) => (p._id || p) === product._id))
                .map((sec) => (
                  <span key={sec._id} className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs font-bold">
                    {sec.title}
                  </span>
                ))
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenFeature(product);
            }}
            className="py-2.5 px-4 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition flex items-center gap-1.5"
          >
            <FireIcon className="w-4 h-4" /> Feature This Product
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenEdit(product);
            }}
            className="py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 transition"
          >
            Edit Product
          </button>
        </div>
      </div>
    </Modal>
  );
};
