import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

import { PriceAdjustModal } from '@/app/components/price-matrix/price-adjust-modal.component';
import { PriceFillModal } from '@/app/components/price-matrix/price-fill-modal.component';
import { PriceEditCellModal } from '@/app/components/price-matrix/price-edit-cell-modal.component';
import { PriceCreateMenuModal } from '@/app/components/price-matrix/price-create-menu-modal.component';
import { PriceMatrixTable } from '@/app/components/price-matrix/price-matrix-table.component';

const PriceMatrixView = ({ branchId }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [matrixViewMode, setMatrixViewMode] = useState('COMBINED'); // 'COMBINED' | 'VARIANCE' | 'LKR'
  const [editingCell, setEditingCell] = useState(null);
  const [editPriceInput, setEditPriceInput] = useState('');

  const [adjustModalMenu, setAdjustModalMenu] = useState(null);
  const [adjustPercentage, setAdjustPercentage] = useState('15');
  const [adjustSourceMode, setAdjustSourceMode] = useState('BASE_MENU');

  const [fillModalMenu, setFillModalMenu] = useState(null);
  const [fillPercentage, setFillPercentage] = useState('15');
  const [fillOverwrite, setFillOverwrite] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    isBaseMenu: false,
  });

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['priceMatrix', branchId, currentPage, selectedCategory, searchTerm],
    queryFn: async () => {
      const res = await api.get('/menus/price-matrix', {
        params: {
          branchId,
          page: currentPage,
          limit: pageSize,
          search: searchTerm,
          categoryId: selectedCategory,
        },
      });
      return res;
    },
    enabled: !!branchId,
  });

  const matrixPayload = responseData?.data || responseData || {};
  const meta = responseData?.meta || { total: 0, page: 1, limit: pageSize, totalPages: 1 };
  const rawMenus = matrixPayload.menus || [];
  const menus = rawMenus.map((m) => ({
    ...m,
    id: m.id || m._id,
    _id: m._id || m.id,
  }));
  const rawProducts = matrixPayload.products || [];
  const products = rawProducts.map((p) => ({
    ...p,
    id: p.id || p._id,
    _id: p._id || p.id,
  }));
  const { categories = [], matrix = {} } = matrixPayload;


  const createMenuMutation = useMutation({
    mutationFn: (data) => api.post('/menus', { ...data, branchId }),
    onSuccess: () => {
      toast.success('New menu created!');
      queryClient.invalidateQueries(['priceMatrix']);
      queryClient.invalidateQueries(['ownerMenus']);
      setCreateModalOpen(false);
      setCreateFormData({ name: '', description: '', status: 'ACTIVE', isBaseMenu: false });
    },
    onError: (err) => toast.error(err.message || 'Failed to create menu.'),
  });

  const updatePriceMutation = useMutation({
    mutationFn: async ({ menuItemId, menuId, productId, price }) => {
      const numPrice = Number(price);
      if (menuItemId) {
        return api.put(`/menu-items/${parseInt(menuItemId, 10)}`, { price: numPrice });
      } else {
        return api.post('/menu-items', {
          menuId: parseInt(menuId, 10),
          productId: parseInt(productId, 10),
          price: numPrice,
        });
      }
    },
    onSuccess: () => {

      toast.success('Price updated in matrix!');
      queryClient.invalidateQueries(['priceMatrix']);
      queryClient.invalidateQueries(['ownerMenus']);
      setEditingCell(null);
    },
    onError: (err) => toast.error(err.message || 'Failed to update price.'),
  });

  const adjustPriceMutation = useMutation({
    mutationFn: ({ menuId, percentage, sourceMode }) =>
      api.post(`/menus/${menuId}/adjust-prices`, { percentage, sourceMode }),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Menu prices adjusted!');
      queryClient.invalidateQueries(['priceMatrix']);
      queryClient.invalidateQueries(['ownerMenus']);
      setAdjustModalMenu(null);
    },
    onError: (err) => toast.error(err.message || 'Failed to adjust menu prices.'),
  });

  const fillMissingMutation = useMutation({
    mutationFn: ({ menuId, percentage, overwriteExisting }) =>
      api.post(`/menus/${menuId}/fill-missing`, { percentage, overwriteExisting }),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Populated menu items successfully!');
      queryClient.invalidateQueries(['priceMatrix']);
      queryClient.invalidateQueries(['ownerMenus']);
      setFillModalMenu(null);
    },
    onError: (err) => toast.error(err.message || 'Failed to populate menu items.'),
  });

  const removeProductMutation = useMutation({
    mutationFn: (menuItemId) => api.delete(`/menu-items/${menuItemId}`),
    onSuccess: () => {
      toast.success('Removed product from menu!');
      queryClient.invalidateQueries(['priceMatrix']);
      queryClient.invalidateQueries(['ownerMenus']);
      setEditingCell(null);
    },
    onError: (err) => toast.error(err.message || 'Failed to remove item.'),
  });

  const downloadCSVReport = () => {
    if (products.length === 0 || menus.length === 0) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    const headerRow = ['Product Name', 'Category', 'Prep Time', ...menus.map((m) => `"${m.name}"`)].join(',');
    csvContent += headerRow + '\r\n';

    products.forEach((p) => {
      const row = [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category?.name || 'General'}"`,
        `"${p.prepTime || '15 mins'}"`,
        ...menus.map((m) => {
          const item = matrix[p._id]?.[m._id];
          return item ? item.price : 'N/A';
        }),
      ];
      csvContent += row.join(',') + '\r\n';
    });

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Price_Matrix_Report_Page${currentPage}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Price Matrix report downloaded!');
  };

  const baseMenu = menus.find((m) => m.isBaseMenu);
  const basePriceForCell = editingCell && baseMenu ? matrix[editingCell.productId]?.[baseMenu._id]?.price : undefined;

  React.useEffect(() => {
    if (editingCell) {
      setEditPriceInput(
        editingCell.currentPrice !== undefined && editingCell.currentPrice !== ''
          ? String(editingCell.currentPrice)
          : ''
      );
    }
  }, [editingCell]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-lg">
            {meta.total ?? products.length}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Products</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Server Paginated Items</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-lg">
            {menus.length}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Digital Menus</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Compared Across Columns</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-extrabold text-lg">
            {pageSize}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Items Per Page</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">High Scale Performance</p>
          </div>
        </div>
      </div>

      {/* Average Menu % Markup Summary Banner */}
      {baseMenu && menus.length > 1 && (
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-extrabold text-indigo-950 dark:text-indigo-200">
            <StarSolidIcon className="w-4 h-4 text-amber-500" />
            <span>Average Menu Markups vs Base ({baseMenu.name}):</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {menus.map((m) => {
              if (m.isBaseMenu) return null;
              let totalPct = 0;
              let count = 0;
              products.forEach((p) => {
                const baseP = matrix[p._id]?.[baseMenu._id]?.price;
                const targetP = matrix[p._id]?.[m._id]?.price;
                if (baseP !== undefined && targetP !== undefined && baseP > 0) {
                  totalPct += ((targetP - baseP) / baseP) * 100;
                  count++;
                }
              });
              const avg = count > 0 ? totalPct / count : 0;

              return (
                <span
                  key={m._id}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="text-slate-600 dark:text-slate-400">{m.name}:</span>
                  <span className={`font-black ${avg > 0 ? 'text-indigo-600 dark:text-indigo-400' : avg < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
                    {avg > 0 ? `+${avg.toFixed(1)}%` : `${avg.toFixed(1)}%`}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter & Toolbar Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-72">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search catalog products..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => { setSelectedCategory('ALL'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => { setSelectedCategory(cat._id); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition whitespace-nowrap ${
                selectedCategory === cat._id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-1 text-[11px] font-bold">
            <button
              onClick={() => setMatrixViewMode('COMBINED')}
              className={`px-2.5 py-1 rounded-lg transition ${
                matrixViewMode === 'COMBINED' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              LKR + %
            </button>
            <button
              onClick={() => setMatrixViewMode('VARIANCE')}
              className={`px-2.5 py-1 rounded-lg transition ${
                matrixViewMode === 'VARIANCE' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              % Table
            </button>
            <button
              onClick={() => setMatrixViewMode('LKR')}
              className={`px-2.5 py-1 rounded-lg transition ${
                matrixViewMode === 'LKR' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              LKR Only
            </button>
          </div>

          <button
            onClick={() => {
              setCreateFormData({ name: '', description: '', status: 'ACTIVE', isBaseMenu: menus.length === 0 });
              setCreateModalOpen(true);
            }}
            className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Menu</span>
          </button>

          {menus.length > 0 && (
            <button
              onClick={() => {
                const firstNonBase = menus.find((m) => !m.isBaseMenu) || menus[0];
                setAdjustModalMenu(firstNonBase);
                setAdjustPercentage('15');
                setAdjustSourceMode('BASE_MENU');
              }}
              className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <CalculatorIcon className="w-4 h-4" />
              <span>% Bulk Adjust</span>
            </button>
          )}

          <button
            onClick={downloadCSVReport}
            className="py-2 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-500">Fetching Paginated Price Matrix...</p>
          </div>
        ) : menus.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No menus created yet for this branch. Please create a menu first!
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No catalog products matched your query.
          </div>
        ) : (
          <>
            <PriceMatrixTable
              menus={menus}
              products={products}
              matrix={matrix}
              baseMenu={baseMenu}
              matrixViewMode={matrixViewMode}
              onCellClick={setEditingCell}
              onAdjustMenu={(m) => {
                setAdjustModalMenu(m);
                setAdjustPercentage('15');
                setAdjustSourceMode('BASE_MENU');
              }}
              onFillMenu={(m) => {
                setFillModalMenu(m);
                setFillPercentage('15');
                setFillOverwrite(false);
              }}
            />

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, meta.total || products.length)} of {meta.total || products.length} products
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Page {currentPage} of {meta.totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, meta.totalPages || 1))}
                  disabled={currentPage >= (meta.totalPages || 1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <PriceAdjustModal
        adjustModalMenu={adjustModalMenu}
        onClose={() => setAdjustModalMenu(null)}
        menus={menus}
        adjustPercentage={adjustPercentage}
        setAdjustPercentage={setAdjustPercentage}
        adjustSourceMode={adjustSourceMode}
        setAdjustSourceMode={setAdjustSourceMode}
        onAdjustSubmit={(e) => {
          e.preventDefault();
          const targetMenuId = adjustModalMenu?.id || adjustModalMenu?._id;
          if (!targetMenuId) return;
          adjustPriceMutation.mutate({
            menuId: parseInt(targetMenuId, 10),
            percentage: Number(adjustPercentage),
            sourceMode: adjustSourceMode,
          });
        }}
        isPending={adjustPriceMutation.isPending}
        onSelectMenu={setAdjustModalMenu}
      />

      <PriceFillModal
        fillModalMenu={fillModalMenu}
        onClose={() => setFillModalMenu(null)}
        menus={menus}
        fillPercentage={fillPercentage}
        setFillPercentage={setFillPercentage}
        fillOverwrite={fillOverwrite}
        setFillOverwrite={setFillOverwrite}
        onFillSubmit={(e) => {
          e.preventDefault();
          const targetMenuId = fillModalMenu?.id || fillModalMenu?._id;
          if (!targetMenuId) return;
          const pVal = Number(fillPercentage);
          const confirmMsg = fillOverwrite
            ? `Are you sure you want to populate "${fillModalMenu.name}" with a +${pVal}% markup and OVERWRITE existing prices?`
            : `Are you sure you want to populate missing items into "${fillModalMenu.name}" with a +${pVal}% markup?`;
          if (!window.confirm(confirmMsg)) return;
          fillMissingMutation.mutate({
            menuId: parseInt(targetMenuId, 10),
            percentage: pVal,
            overwriteExisting: fillOverwrite,
          });
        }}
        isPending={fillMissingMutation.isPending}
        onSelectMenu={setFillModalMenu}
      />

      <PriceEditCellModal
        editingCell={editingCell}
        onClose={() => setEditingCell(null)}
        editPriceInput={editPriceInput}
        setEditPriceInput={setEditPriceInput}
        basePriceForCell={basePriceForCell}
        baseMenu={baseMenu}
        onSavePrice={(e) => {
          e.preventDefault();
          const numPrice = Number(editPriceInput);
          if (isNaN(numPrice) || numPrice < 0) {
            toast.error('Please enter a valid price');
            return;
          }
          updatePriceMutation.mutate({
            menuItemId: editingCell.menuItemId,
            menuId: editingCell.menuId,
            productId: editingCell.productId,
            price: numPrice,
          });
        }}
        onRemoveItem={(menuItemId) => {
          if (window.confirm(`Remove ${editingCell.productName} from ${editingCell.menuName}?`)) {
            removeProductMutation.mutate(menuItemId);
          }
        }}
        isSaving={updatePriceMutation.isPending}
        isRemoving={removeProductMutation.isPending}
      />

      <PriceCreateMenuModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        createFormData={createFormData}
        setCreateFormData={setCreateFormData}
        onSubmit={(e) => {
          e.preventDefault();
          createMenuMutation.mutate(createFormData);
        }}
        isSubmitting={createMenuMutation.isPending}
        menusCount={menus.length}
      />
    </div>
  );
};

export default PriceMatrixView;
