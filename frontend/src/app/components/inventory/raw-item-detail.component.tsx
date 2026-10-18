import React from 'react';
import type {
  InventoryItemModel,
  KitchenPrepDefinitionModel,
  RawInventoryBatchModel,
  KitchenPrepBatchModel,
} from '@/app/models/inventory.model';
import { WastageLogSection } from './wastage-log-section.component';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  PlusIcon,
  CalendarDaysIcon,
  BeakerIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

export interface RawItemDetailProps {
  item: InventoryItemModel;
  preps: KitchenPrepDefinitionModel[];
  batches: RawInventoryBatchModel[];
  prepBatches: KitchenPrepBatchModel[];
  batchesLoading: boolean;
  onBack: () => void;
  onEditItem: () => void;
  onInwardStock: () => void;
  onDefinePrep: () => void;
  onEditPrep: (prep: KitchenPrepDefinitionModel) => void;
  onLogPrepBatch: (prep: KitchenPrepDefinitionModel) => void;
}

export const RawItemDetail: React.FC<RawItemDetailProps> = ({
  item,
  preps,
  batches,
  prepBatches,
  batchesLoading,
  onBack,
  onEditItem,
  onInwardStock,
  onDefinePrep,
  onEditPrep,
  onLogPrepBatch,
}) => {
  const [prepsPage, setPrepsPage] = React.useState(1);
  const [batchesPage, setBatchesPage] = React.useState(1);
  const [batchStatusFilter, setBatchStatusFilter] = React.useState<'ALL' | 'ACTIVE'>('ALL');

  const PREPS_PAGE_SIZE = 4;
  const BATCHES_PAGE_SIZE = 4;

  const itemPreps = preps.filter((p) => p.baseRawItemId === item.id);
  const totalPrepPages = Math.ceil(itemPreps.length / PREPS_PAGE_SIZE) || 1;
  const currentPrepPage = Math.min(prepsPage, totalPrepPages);
  const paginatedPreps = itemPreps.slice((currentPrepPage - 1) * PREPS_PAGE_SIZE, currentPrepPage * PREPS_PAGE_SIZE);

  const filteredBatches = React.useMemo(() => {
    if (batchStatusFilter === 'ACTIVE') {
      return batches.filter((b) => b.status === 'ACTIVE' && b.quantityRemaining > 0);
    }
    return batches;
  }, [batches, batchStatusFilter]);

  const totalBatchPages = Math.ceil(filteredBatches.length / BATCHES_PAGE_SIZE) || 1;
  const currentBatchPage = Math.min(batchesPage, totalBatchPages);
  const paginatedBatches = filteredBatches.slice((currentBatchPage - 1) * BATCHES_PAGE_SIZE, currentBatchPage * BATCHES_PAGE_SIZE);

  const itemPrepBatches = prepBatches.filter((b) => {
    if (b.baseRawItemId) return b.baseRawItemId === item.id;
    const matchedPrep = preps.find((p) => p.id === b.prepDefinitionId);
    return matchedPrep && matchedPrep.baseRawItemId === item.id;
  });

  const totalRawWastage = itemPrepBatches.reduce((acc, b) => acc + (b.wastageQuantity || 0), 0);
  const totalWastageCost = totalRawWastage * (item.unitCost || 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition"
            title="Back to all raw items"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{item.name}</h3>
              {item.currentStock <= item.reorderThreshold && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  Low Stock
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
              {item.sku && <span>SKU: <strong className="text-slate-700 dark:text-slate-200">{item.sku}</strong></span>}
              <span>Supplier: <strong className="text-slate-700 dark:text-slate-200">{item.supplierName || 'Direct / None'}</strong></span>
              <span>Tracking Unit: <strong className="text-slate-700 dark:text-slate-200">{item.uomName || item.uomSymbol} ({item.uomSymbol})</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onEditItem}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition"
          >
            <PencilSquareIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span>Edit Item</span>
          </button>
          <button
            type="button"
            onClick={onInwardStock}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Stock Inward</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Total Current Stock</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {Number(item.currentStock).toFixed(2)} <span className="text-xs font-bold text-slate-400">{item.uomSymbol}</span>
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Weighted Unit Cost</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            Rs. {Number(item.unitCost).toFixed(2)} <span className="text-xs font-bold text-slate-400">/ {item.uomSymbol}</span>
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Reorder Threshold</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {Number(item.reorderThreshold).toFixed(2)} <span className="text-xs font-bold text-slate-400">{item.uomSymbol}</span>
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-rose-500 block uppercase tracking-wider">Trimmings / Wastage</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
            {totalRawWastage.toFixed(2)} <span className="text-xs font-bold text-rose-400">{item.uomSymbol}</span>
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Est. loss: Rs. {totalWastageCost.toFixed(2)}</span>
        </div>
      </div>

      {/* Two Column Grid: Preps & Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Preps */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BeakerIcon className="w-4 h-4 text-emerald-500" />
                Kitchen Preps ({itemPreps.length})
              </h4>
              <p className="text-xs text-slate-400">Recipes chefs prepare from this raw item</p>
            </div>
            <button
              type="button"
              onClick={onDefinePrep}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Define Prep</span>
            </button>
          </div>

          {itemPreps.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-xs">
              No kitchen preps defined for {item.name} yet. Click "Define Prep" to create recipes.
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedPreps.map((prep) => (
                <div
                  key={prep.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">{prep.name}</span>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[11px] text-slate-400">Yield: <strong>{Number(prep.expectedYieldPercent).toFixed(0)}%</strong></span>
                      <span className="text-[11px] text-slate-400">• Ready Stock: <strong>{Number(prep.currentStock).toFixed(2)} {prep.uomSymbol}</strong></span>
                      {prep.portionSizeValue && (
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                          ⚖️ {Number(prep.portionSizeValue)} {prep.portionSizeUomSymbol || 'g'} / {prep.uomSymbol || 'portion'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditPrep(prep)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onLogPrepBatch(prep)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                    >
                      <BeakerIcon className="w-3.5 h-3.5" />
                      <span>Log Batch</span>
                    </button>
                  </div>
                </div>
              ))}

              {totalPrepPages > 1 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  <span>Showing {(currentPrepPage - 1) * PREPS_PAGE_SIZE + 1} - {Math.min(currentPrepPage * PREPS_PAGE_SIZE, itemPreps.length)} of {itemPreps.length} preps</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPrepsPage((p) => Math.max(1, p - 1))}
                      disabled={currentPrepPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
                    >
                      <ChevronLeftIcon className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{currentPrepPage} / {totalPrepPages}</span>
                    <button
                      type="button"
                      onClick={() => setPrepsPage((p) => Math.min(totalPrepPages, p + 1))}
                      disabled={currentPrepPage === totalPrepPages}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
                    >
                      <ChevronRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Batches */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDaysIcon className="w-4 h-4 text-emerald-500" />
                Inwarded Batches & Expiry Dates
              </h4>
              <p className="text-xs text-slate-400">Automatic FIFO / FEFO consumption order</p>
            </div>
            {batches.length > 0 && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => { setBatchStatusFilter('ALL'); setBatchesPage(1); }}
                  className={`px-2 py-0.5 rounded-md transition ${batchStatusFilter === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
                >
                  All ({batches.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setBatchStatusFilter('ACTIVE'); setBatchesPage(1); }}
                  className={`px-2 py-0.5 rounded-md transition ${batchStatusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  Active ({batches.filter((b) => b.status === 'ACTIVE' && b.quantityRemaining > 0).length})
                </button>
              </div>
            )}
          </div>

          {batchesLoading ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading batches...</div>
          ) : filteredBatches.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-xs">
              No batches recorded for this item.
            </div>
          ) : (
            <div className="space-y-2.5">
              {paginatedBatches.map((b) => {
                const isDepleted = b.status === 'DEPLETED' || Number(b.quantityRemaining) <= 0;
                const isExp = b.expiryDate && new Date(b.expiryDate) < new Date();
                return (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition ${
                      isDepleted
                        ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-60'
                        : isExp
                        ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{b.batchNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDepleted ? 'bg-slate-200 text-slate-600' : isExp ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {isDepleted ? 'Depleted' : isExp ? 'Expired' : 'Active'}
                        </span>
                        {b.supplierName && <span className="text-[10px] text-slate-400">via {b.supplierName}</span>}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                        <span>Inwarded: {b.receivedDate}</span>
                        {b.expiryDate && (
                          <span className={`font-semibold flex items-center gap-1 ${isExp ? 'text-rose-600' : 'text-slate-600 dark:text-slate-300'}`}>
                            <ClockIcon className="w-3 h-3" />
                            Expiry: {b.expiryDate}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 dark:text-white block">
                        {Number(b.quantityRemaining).toFixed(2)} / {Number(b.quantityReceived).toFixed(2)} {item.uomSymbol}
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                        Rs. {Number(b.unitCost).toFixed(2)} / unit
                      </span>
                    </div>
                  </div>
                );
              })}

              {totalBatchPages > 1 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  <span>Showing {(currentBatchPage - 1) * BATCHES_PAGE_SIZE + 1} - {Math.min(currentBatchPage * BATCHES_PAGE_SIZE, filteredBatches.length)} of {filteredBatches.length} batches</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBatchesPage((p) => Math.max(1, p - 1))}
                      disabled={currentBatchPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
                    >
                      <ChevronLeftIcon className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{currentBatchPage} / {totalBatchPages}</span>
                    <button
                      type="button"
                      onClick={() => setBatchesPage((p) => Math.min(totalBatchPages, p + 1))}
                      disabled={currentBatchPage === totalBatchPages}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
                    >
                      <ChevronRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Wastage Table */}
      <WastageLogSection batches={itemPrepBatches} detailItem={item} />
    </div>
  );
};
