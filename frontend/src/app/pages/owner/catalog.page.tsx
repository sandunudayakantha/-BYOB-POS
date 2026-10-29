import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBranch } from '@/contexts/BranchContext';
import { useCategoriesUseCase } from '@/app/domain/products/use-categories.use-case';
import { useProductsUseCase } from '@/app/domain/products/use-products.use-case';
import { ProductsPage } from '@/app/pages/owner/products.page';
import { CategoriesPage } from '@/app/pages/owner/categories.page';
import { ShoppingBagIcon, TagIcon } from '@heroicons/react/24/outline';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeBranch } = useBranch();
  const branchId = String(activeBranch?._id || activeBranch?.id || '');

  const currentTab = searchParams.get('tab') === 'categories' ? 'categories' : 'products';

  const handleTabChange = (tabKey: 'products' | 'categories') => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (tabKey === 'products') {
        nextParams.delete('tab');
      } else {
        nextParams.set('tab', tabKey);
      }
      return nextParams;
    });
  };

  const { categories } = useCategoriesUseCase({ branchId });
  const { meta } = useProductsUseCase({ branchId, page: 1, limit: 1 });

  const productsTotal = useMemo(() => meta?.total ?? null, [meta]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Catalog Management</span>
            {activeBranch?.name && (
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {activeBranch.name}
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your dishes, drinks, prices, and organize them into navigational categories.
          </p>
        </div>

        <div className="inline-flex p-1 bg-stone-200/70 dark:bg-stone-900/80 rounded-2xl border border-stone-300/50 dark:border-stone-800/60 self-start sm:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => handleTabChange('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'products'
                ? 'bg-white dark:bg-stone-950 text-amber-600 dark:text-amber-400 shadow-sm border border-stone-200/60 dark:border-stone-800'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBagIcon className="w-4 h-4" />
            <span>Products</span>
            {productsTotal !== null && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  currentTab === 'products'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-stone-300 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                {productsTotal}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'categories'
                ? 'bg-white dark:bg-stone-950 text-amber-600 dark:text-amber-400 shadow-sm border border-stone-200/60 dark:border-stone-800'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <TagIcon className="w-4 h-4" />
            <span>Categories</span>
            {categories.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  currentTab === 'categories'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-stone-300 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                {categories.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="pt-1">
        {currentTab === 'products' ? (
          <ProductsPage embedded={true} />
        ) : (
          <CategoriesPage embedded={true} />
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
