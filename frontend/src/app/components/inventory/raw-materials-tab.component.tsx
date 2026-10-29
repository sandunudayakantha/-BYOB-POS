import React from 'react';
import type { InventoryItemModel } from '@/app/models/inventory.model';
import { Button } from '@/atomic/atm.button';
import { PlusIcon, ExclamationTriangleIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
          <h3 className="font-extrabold text-lg text-stone-900 dark:text-white">Raw Inventory Items</h3>
          <p className="text-xs text-stone-500">
            Purchased raw materials (e.g., Whole Raw Chicken, Eggs, Basmati Rice, Oil). Click any item to inspect batches and define preps.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          rounded="full"
          onClick={onOpenAddModal}
          className="flex items-center gap-2 py-2 px-4 font-bold text-xs shadow-none"
        >
          <PlusIcon className="w-4 h-4 stroke-[2.5]" />
          <span>Add Raw Item</span>
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search raw inventory items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Items Table Container */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-stone-400">Loading raw inventory items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700">
          No raw items found matching your criteria.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-stone-200/80 dark:border-white/[0.07] bg-white/75 dark:bg-stone-900/40 backdrop-blur-xl shadow-xl shadow-black/5">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100/80 dark:bg-stone-950/80 border-b border-stone-200/80 dark:border-white/[0.06] text-stone-600 dark:text-stone-300 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Raw Item & SKU</th>
                <th className="py-3.5 px-4 text-right">Current Stock</th>
                <th className="py-3.5 px-4 text-right">Unit Cost</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/[0.05]">
              {filteredItems.map((row) => {
                const isLow = row.currentStock <= row.reorderThreshold;
                return (
                  <tr
                    key={row.id}
                    onClick={() => onSelectItem(row)}
                    className="cursor-pointer hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition group"
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-stone-900 dark:text-white flex items-center gap-2 group-hover:text-amber-500 transition">
                          <span>{row.name}</span>
                          {isLow && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                              <ExclamationTriangleIcon className="w-3 h-3" />
                              Low Stock
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-2">
                          {row.sku && <span>SKU: {row.sku} • </span>}
                          <span>{row.supplierName ? `Supplier: ${row.supplierName}` : 'Direct Stock'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-stone-900 dark:text-white">
                      {Number(row.currentStock).toFixed(2)} {row.uomSymbol || ''}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-amber-600 dark:text-amber-400">
                      Rs. {Number(row.unitCost).toFixed(2)} / {row.uomSymbol || 'unit'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenStockModal(row);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-none transition active:scale-95"
                          title="Add stock inward"
                        >
                          <PlusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Add Stock</span>
                        </button>
                        {onDeleteItem && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteItem(row);
                            }}
                            className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-95"
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
