import React from 'react';
import type { InventoryItemModel } from '@/app/models/inventory.model';
import { PlusIcon, AdjustmentsHorizontalIcon, ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';

export interface RawMaterialsTabProps {
  items: InventoryItemModel[];
  isLoading: boolean;
  onSelectItem: (item: InventoryItemModel) => void;
  onOpenAddModal: () => void;
  onOpenStockModal: (item: InventoryItemModel) => void;
  onDeleteItem?: (item: InventoryItemModel) => void;
}

export const RawMaterialsTab: React.FC<RawMaterialsTabProps> = ({
  items,
  isLoading,
  onSelectItem,
  onOpenAddModal,
  onOpenStockModal,
  onDeleteItem,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredItems = React.useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        (item.sku && item.sku.toLowerCase().includes(term)) ||
        (item.supplierName && item.supplierName.toLowerCase().includes(term))
    );
  }, [items, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Raw Inventory Items</h3>
          <p className="text-xs text-slate-500">
            Purchased raw materials (e.g., Whole Raw Chicken, Eggs, Basmati Rice, Oil). Click any item to inspect batches and define preps.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Raw Item</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <input
          type="text"
          placeholder="Search raw inventory items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-3 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Items Table Container */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading raw inventory items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          No raw items found matching your criteria.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Raw Item & SKU</th>
                <th className="py-3.5 px-4 text-right">Current Stock</th>
                <th className="py-3.5 px-4 text-right">Unit Cost</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map((row) => {
                const isLow = row.currentStock <= row.reorderThreshold;
                return (
                  <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="cursor-pointer group" onClick={() => onSelectItem(row)}>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2 group-hover:text-emerald-500 transition">
                          <span>{row.name}</span>
                          {isLow && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                              <ExclamationTriangleIcon className="w-3 h-3" />
                              Low Stock
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                          {row.sku && <span>SKU: {row.sku} • </span>}
                          <span>{row.supplierName ? `Supplier: ${row.supplierName}` : 'Direct Stock'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                      {Number(row.currentStock).toFixed(2)} {row.uomSymbol || ''}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      Rs. {Number(row.unitCost).toFixed(2)} / {row.uomSymbol || 'unit'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenStockModal(row)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                          title="Add stock inward"
                        >
                          <PlusIcon className="w-3.5 h-3.5" />
                          <span>Add Stock</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectItem(row)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-400 font-bold text-xs border border-slate-200 dark:border-slate-700 transition"
                        >
                          <AdjustmentsHorizontalIcon className="w-3.5 h-3.5 text-emerald-500" />
                          <span>View & Manage</span>
                        </button>
                        {onDeleteItem && (
                          <button
                            type="button"
                            onClick={() => onDeleteItem(row)}
                            className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Delete raw material"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
