import React from 'react';
import Modal from '@/components/Modal';
import { FireIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/outline';

interface ProductFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  featuredSections: any[];
  onToggleFeature: (sectionId: string, updatedIds: string[]) => void;
}

export const ProductFeatureModal: React.FC<ProductFeatureModalProps> = ({
  isOpen,
  onClose,
  product,
  featuredSections,
  onToggleFeature,
}) => {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Feature "${product.name}" on Banners`}>
      <div className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select which promotional banners should feature <span className="font-bold text-slate-900 dark:text-white">{product.name}</span> on the customer QR menu:
        </p>

        {featuredSections.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
            No featured banners created yet for this branch. Please create a banner first under the Featured Banners menu.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {featuredSections.map((section) => {
              const currentProductIds = Array.from(
                new Set((section.products || []).map((p: any) => Number(p?._id ?? p?.id ?? p)).filter((id: number) => !isNaN(id)))
              );
              const targetProductId = Number(product._id ?? product.id);
              const isIncluded = currentProductIds.includes(targetProductId);
              return (
                <div
                  key={section._id}
                  onClick={() => {
                    const confirmMsg = isIncluded
                      ? `Are you sure you want to remove "${product.name}" from "${section.title}"?`
                      : `Are you sure you want to add "${product.name}" to "${section.title}"?`;

                    if (!window.confirm(confirmMsg)) return;

                    const updatedIds = isIncluded
                      ? currentProductIds.filter((id: number) => id !== targetProductId)
                      : [...currentProductIds, targetProductId];

                    onToggleFeature(section._id, updatedIds);
                  }}

                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                    isIncluded
                      ? 'bg-amber-50/80 dark:bg-amber-950/60 border-amber-400'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
                      <FireIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{section.title}</h4>
                      <p className="text-[10px] text-slate-400">{section.description || 'Promotional section'}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      isIncluded
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isIncluded ? (
                      <>
                        <CheckIcon className="w-4 h-4" /> Featured
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4" /> Add to Banner
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
