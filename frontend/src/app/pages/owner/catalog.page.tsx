import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBranch } from '@/contexts/BranchContext';
import { useCategoriesUseCase } from '@/app/domain/products/use-categories.use-case';
import { useProductsUseCase } from '@/app/domain/products/use-products.use-case';
import { ProductsPage } from '@/app/pages/owner/products.page';
import { CategoriesPage } from '@/app/pages/owner/categories.page';
import { BarBeveragesTab } from '@/app/components/products/bar-beverages-tab.component';
import { ShoppingBagIcon, TagIcon, BeakerIcon } from '@heroicons/react/24/outline';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeBranch } = useBranch();
  const branchId = String(activeBranch?._id || activeBranch?.id || '');

  const rawTab = searchParams.get('tab');
  const currentTab = rawTab === 'categories' ? 'categories' : rawTab === 'beverages' ? 'beverages' : 'products';

  const handleTabChange = (tabKey: 'products' | 'beverages' | 'categories') => {
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
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>Catalog & Menu Management</span>
            {activeBranch?.name && (
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activeBranch.name}
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your food dishes, bar drinks & mixology recipes, prices, and categories.
          </p>
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto shadow-sm">
          <button
            type="button"
            onClick={() => handleTabChange('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'products'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBagIcon className="w-4 h-4" />
            <span>Food Dishes</span>
            {productsTotal !== null && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  currentTab === 'products'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {productsTotal}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('beverages')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'beverages'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BeakerIcon className="w-4 h-4 text-emerald-600" />
            <span>Bar & Beverages</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'categories'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TagIcon className="w-4 h-4" />
            <span>Categories</span>
            {categories.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  currentTab === 'categories'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-200 text-slate-700'
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
        ) : currentTab === 'beverages' ? (
          <BarBeveragesTab branchId={branchId} />
        ) : (
          <CategoriesPage embedded={true} />
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
