import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBranch } from '../../contexts/BranchContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import ProductsPage from './ProductsPage';
import CategoriesPage from './CategoriesPage';
import { ShoppingBagIcon, TagIcon } from '@heroicons/react/24/outline';

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeBranch } = useBranch();

  // Active tab from URL query param, default to 'products'
  const currentTab = searchParams.get('tab') === 'categories' ? 'categories' : 'products';

  const handleTabChange = (tabKey) => {
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

  // Quick query count badges for branch
  const { data: categories = [] } = useQuery({
    queryKey: ['ownerCategories', activeBranch?._id],
    queryFn: async () => {
      const res = await api.get('/categories', { params: { branchId: activeBranch?._id } });
      return res.data || [];
    },
    enabled: !!activeBranch
  });

  const { data: productsData } = useQuery({
    queryKey: ['ownerProductsCount', activeBranch?._id],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { branchId: activeBranch?._id, page: 1, limit: 1 }
      });
      return res;
    },
    enabled: !!activeBranch
  });

  const productsTotal = useMemo(() => {
    return productsData?.pagination?.total ?? productsData?.data?.meta?.total ?? null;
  }, [productsData]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Catalog Management
            {activeBranch?.name && (
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {activeBranch.name}
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your dishes, drinks, prices, and organize them into navigational categories.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="inline-flex p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 self-start sm:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => handleTabChange('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'products'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBagIcon className="w-4 h-4" />
            <span>Products</span>
            {productsTotal !== null && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                currentTab === 'products'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {productsTotal}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'categories'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TagIcon className="w-4 h-4" />
            <span>Categories</span>
            {categories.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                currentTab === 'categories'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {categories.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
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
