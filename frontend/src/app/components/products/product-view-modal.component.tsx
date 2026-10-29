import React from 'react';
import Modal from '@/components/Modal';
import { Badge } from '@/atomic/atm.badge';
import { PhotoIcon, TagIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';

interface ProductViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  featuredSections: any[];
  categories?: any[];
  onOpenFeature: (product: any) => void;
  onOpenEdit?: (product: any) => void;
}

export const ProductViewModal: React.FC<ProductViewModalProps> = ({
  isOpen,
  onClose,
  product,
  featuredSections,
  categories,
  onOpenFeature,
  onOpenEdit,
}) => {
  if (!product) return null;

  const categoryDisplayName =
    product.categoryName ||
    (typeof product.category === 'string' ? product.category : product.category?.name) ||
    categories?.find((c: any) => String(c._id || c.id) === String(product.categoryId || product.category))?.name ||
    'Unassigned';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Showcase & Specs">
      <div className="space-y-5">
        <div className="w-full h-52 rounded-2xl bg-stone-100 dark:bg-stone-900/60 overflow-hidden relative border border-stone-200 dark:border-stone-800">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-2">
              <PhotoIcon className="w-10 h-10" />
              <span className="text-xs font-semibold">No Image Uploaded</span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge variant={product.available ? 'primary' : 'danger'}>
              {product.available ? 'Available' : 'Sold Out'}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-stone-900 dark:text-white">{product.name}</h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            {product.description || 'No detailed description added for this product.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center gap-3">
            <TagIcon className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400">Category</p>
              <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                {categoryDisplayName}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center gap-3">
            <ClockIcon className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400">Prep Time</p>
              <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                {product.prepTime || '15-20 mins'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <FireIcon className="w-4 h-4 text-amber-500" />
            Featured Banners Assignment
          </h4>
          <div className="flex flex-wrap gap-2">
            {featuredSections.filter((s) => s.products?.some((p: any) => (p._id || p) === product._id)).length === 0 ? (
              <span className="text-xs text-stone-400 italic">Not currently featured on any promotional banners.</span>
            ) : (
              featuredSections
                .filter((s) => s.products?.some((p: any) => (p._id || p) === product._id))
                .map((sec) => (
                  <span key={sec._id} className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
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
            className="py-2.5 px-4 rounded-full bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition flex items-center gap-1.5 shadow-none active:scale-95"
          >
            <FireIcon className="w-4 h-4" /> Feature This Product
          </button>
        </div>
      </div>
    </Modal>
  );
};
