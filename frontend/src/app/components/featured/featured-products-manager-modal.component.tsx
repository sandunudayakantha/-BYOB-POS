import React, { useState } from 'react';
import Modal from '@/components/Modal';
import {
  MagnifyingGlassIcon,
  CheckIcon,
  PlusIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import type { FeaturedSectionModel } from '@/app/models/featured.model';
import type { ProductModel } from '@/app/models/product.model';

export interface FeaturedProductsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: FeaturedSectionModel | null;
  allProducts: ProductModel[];
  onToggleProduct: (productId: number | string, productName: string) => void;
  selectedProductIds: (number | string)[];
}

export const FeaturedProductsManagerModal: React.FC<FeaturedProductsManagerModalProps> = ({
  isOpen,
  onClose,
  section,
  allProducts,
  onToggleProduct,
  selectedProductIds,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredProducts = allProducts.filter((p) =>
    !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const normalizedSelected = new Set(selectedProductIds.map(String));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Products: ${section?.title || ''}`}
    >
      <div className="space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Filter catalog products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {paginatedProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              No products found matching "{searchTerm}".
            </div>
          ) : (
            paginatedProducts.map((prod) => {
              const isIncluded = normalizedSelected.has(String(prod.id));
              return (
                <div
                  key={prod.id}
                  onClick={() => onToggleProduct(prod.id, prod.name)}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                    isIncluded
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-400'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      {prod.imageUrl || prod.image ? (
                        <img
                          src={prod.imageUrl || prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PhotoIcon className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        {prod.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {prod.categoryName || 'General Category'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                      isIncluded
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {isIncluded ? <CheckIcon className="w-3 h-3" /> : <PlusIcon className="w-3 h-3" />}
                    <span>{isIncluded ? 'Featured' : 'Add'}</span>
                  </span>
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
