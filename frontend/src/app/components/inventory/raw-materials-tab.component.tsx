import React from 'react';
import type { InventoryItemModel, ItemType } from '@/app/models/inventory.model';
import { Button } from '@/atomic/atm.button';
import {
  PlusIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  BeakerIcon,
  BuildingStorefrontIcon,
  CakeIcon,
} from '@heroicons/react/24/outline';

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
  const [typeFilter, setTypeFilter] = React.useState<'ALL' | 'RAW_MATERIAL' | 'DIRECT_RESALE' | 'BAR_BEVERAGE'>('ALL');

  const kitchenCount = items.filter((i) => i.itemType === 'RAW_MATERIAL' || !i.itemType).length;
  const resaleCount = items.filter((i) => i.itemType === 'DIRECT_RESALE').length;
  const barCount = items.filter((i) => i.itemType === 'BAR_BEVERAGE').length;

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      // Type Filter
      if (typeFilter !== 'ALL') {
        if (typeFilter === 'RAW_MATERIAL' && item.itemType && item.itemType !== 'RAW_MATERIAL') return false;
        if (typeFilter !== 'RAW_MATERIAL' && item.itemType !== typeFilter) return false;
      }
      // Search Term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(term) ||
        (item.sku && item.sku.toLowerCase().includes(term)) ||
        (item.supplierName && item.supplierName.toLowerCase().includes(term)) ||
        (item.linkedProductName && item.linkedProductName.toLowerCase().includes(term))
      );
    });
  }, [items, searchTerm, typeFilter]);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="font-extrabold text-lg text-stone-900 dark:text-white">Inventory Items</h3>
          <p className="text-xs text-stone-500">
            Kitchen ingredients, direct resale products, and bar beverages with dual-unit bottle & liquid tracking.
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
          <span>Add Item</span>
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-900/80 rounded-2xl border border-stone-200/80 dark:border-stone-800 self-start">
          <button
            type="button"
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              typeFilter === 'ALL'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm border border-stone-200/80 dark:border-stone-700'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('RAW_MATERIAL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              typeFilter === 'RAW_MATERIAL'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CakeIcon className="w-3.5 h-3.5" />
            <span>Kitchen ({kitchenCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('DIRECT_RESALE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              typeFilter === 'DIRECT_RESALE'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BuildingStorefrontIcon className="w-3.5 h-3.5" />
            <span>Retail Goods ({resaleCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('BAR_BEVERAGE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              typeFilter === 'BAR_BEVERAGE'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BeakerIcon className="w-3.5 h-3.5" />
            <span>Bar Liquids ({barCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search items, SKU, suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Items Table Container */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-stone-400">Loading inventory items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700">
          No inventory items found matching your criteria.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-stone-200/80 dark:border-white/[0.07] bg-white/75 dark:bg-stone-900/40 backdrop-blur-xl shadow-xl shadow-black/5">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100/80 dark:bg-stone-950/80 border-b border-stone-200/80 dark:border-white/[0.06] text-stone-600 dark:text-stone-300 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Item & SKU</th>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4 text-right">Current Stock</th>
                <th className="py-3.5 px-4 text-right">Unit Cost</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/[0.05]">
              {filteredItems.map((row) => {
                const isLow = row.currentStock <= row.reorderThreshold;
                const isBar = row.itemType === 'BAR_BEVERAGE';
                const isResale = row.itemType === 'DIRECT_RESALE';

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
                        <div className="text-xs text-stone-400 mt-0.5 flex flex-wrap items-center gap-2">
                          {row.sku && <span>SKU: {row.sku} • </span>}
                          <span>{row.supplierName ? `Supplier: ${row.supplierName}` : 'Direct Stock'}</span>
                          {row.linkedProductName && (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              • POS Menu: {row.linkedProductName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {isBar ? (
                        <div className="inline-flex flex-col">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                            <BeakerIcon className="w-3 h-3" />
                            Bar Beverage
                          </span>
                          {row.packSize && row.dispenseUomSymbol && (
                            <span className="text-[10px] text-stone-400 mt-0.5 pl-1">
                              1 {row.uomSymbol} = {row.packSize} {row.dispenseUomSymbol}
                            </span>
                          )}
                        </div>
                      ) : isResale ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                          <BuildingStorefrontIcon className="w-3 h-3" />
                          Direct Resale
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-full border border-stone-200 dark:border-stone-700">
                          <CakeIcon className="w-3 h-3" />
                          Kitchen Raw
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isBar && row.bottleBreakdown ? (
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1.5 font-extrabold text-stone-900 dark:text-white">
                            <span>{row.bottleBreakdown.sealedUnits} Sealed</span>
                            {row.bottleBreakdown.hasOpenUnit && (
                              <span className="text-cyan-600 dark:text-cyan-400">
                                + 1 Open
                              </span>
                            )}
                            <span className="text-stone-400 font-normal">
                              ({Number(row.currentStock).toFixed(2)} {row.uomSymbol})
                            </span>
                          </div>

                          {row.bottleBreakdown.hasOpenUnit && (
                            <div className="flex items-center gap-2 mt-1 w-36">
                              <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full"
                                  style={{ width: `${Math.min(100, Math.max(0, row.bottleBreakdown.openUnitPercent))}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                                {row.bottleBreakdown.openUnitRemaining.toFixed(0)} {row.dispenseUomSymbol}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="font-extrabold text-stone-900 dark:text-white">
                          {Number(row.currentStock).toFixed(2)} {row.uomSymbol || ''}
                        </span>
                      )}
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
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-none transition active:scale-95"
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

