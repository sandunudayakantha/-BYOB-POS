import React, { useState } from 'react';
import type {
  InventoryItemModel,
  KitchenPrepBatchModel,
  KitchenPrepDefinitionModel,
} from '@/app/models/inventory.model';
import { usePrepBatchesUseCase } from '@/app/domain/inventory/use-prep-batches.use-case';
import { EvidenceLightboxModal } from './evidence-lightbox-modal.component';
import {
  CameraIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ScaleIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { sanitizeUrl } from '@/utils/url';

export interface BatchEvidenceTabProps {
  branchId: number;
  rawItems: InventoryItemModel[];
  preps: KitchenPrepDefinitionModel[];
}

export const BatchEvidenceTab: React.FC<BatchEvidenceTabProps> = ({
  branchId,
  rawItems,
  preps,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [selectedRawItemId, setSelectedRawItemId] = useState<number | null>(null);
  const [selectedPrepId, setSelectedPrepId] = useState<number | null>(null);
  const [onlyWastage, setOnlyWastage] = useState(false);

  const [activeEvidenceModal, setActiveEvidenceModal] = useState<{
    batch: KitchenPrepBatchModel;
    type: 'wastage' | 'prep';
  } | null>(null);

  const { prepBatches, total, isLoading, isFetching, refetch } = usePrepBatchesUseCase({
    branchId,
    rawItemId: selectedRawItemId,
    prepDefinitionId: selectedPrepId,
    search: search.trim() ? search.trim() : null,
    onlyWastage,
    page,
    limit: pageSize,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Cumulative metrics for current query
  const totalWastage = prepBatches.reduce((acc, b) => acc + (b.wastageQuantity || 0), 0);
  const totalInput = prepBatches.reduce((acc, b) => acc + (b.rawInputQuantity || 0), 0);
  const efficiencyRate =
    totalInput > 0
      ? (((totalInput - totalWastage) / totalInput) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
            <ScaleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Total Batches Logged
            </p>
            <p className="text-xl font-extrabold text-stone-900 dark:text-white mt-0.5">
              {total}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400">
            <TrashIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Recorded Wastage
            </p>
            <p className="text-xl font-extrabold text-stone-900 dark:text-white mt-0.5">
              {totalWastage.toFixed(2)}
              <span className="text-xs font-normal text-stone-400 ml-1">units (page)</span>
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
            <CheckBadgeIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Avg Prep Efficiency
            </p>
            <p className="text-xl font-extrabold text-stone-900 dark:text-white mt-0.5">
              {efficiencyRate ? `${efficiencyRate}%` : '—'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
            <CameraIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Photo Verified Batches
            </p>
            <p className="text-xl font-extrabold text-stone-900 dark:text-white mt-0.5">
              {prepBatches.filter((b) => b.wastageImageUrl || b.prepImageUrl).length}
              <span className="text-xs font-normal text-stone-400 ml-1">on current page</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by recipe, staff, or waste reason..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 rounded-full border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              title="Refresh logs"
              className="p-2 rounded-full border border-stone-200 dark:border-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Raw Material Filter */}
            <div className="relative">
              <select
                value={selectedRawItemId ?? ''}
                onChange={(e) => {
                  setSelectedRawItemId(e.target.value ? Number(e.target.value) : null);
                  setPage(1);
                }}
                className="appearance-none pl-3.5 pr-8 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="">All Raw Materials</option>
                {rawItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none stroke-[2]" />
            </div>

            {/* Prep Definition Filter */}
            <div className="relative">
              <select
                value={selectedPrepId ?? ''}
                onChange={(e) => {
                  setSelectedPrepId(e.target.value ? Number(e.target.value) : null);
                  setPage(1);
                }}
                className="appearance-none pl-3.5 pr-8 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="">All Prep Recipes</option>
                {preps.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none stroke-[2]" />
            </div>

            {/* Only Wastage Pill */}
            <button
              type="button"
              onClick={() => {
                setOnlyWastage((prev) => !prev);
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold border transition ${
                onlyWastage
                  ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/30'
                  : 'bg-stone-50 dark:bg-stone-950 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <FunnelIcon className="w-3.5 h-3.5" />
              <span>Only Wastage Recorded</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-xs text-stone-400 space-y-2">
            <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto text-amber-500" />
            <p>Loading preparation batches and evidence logs...</p>
          </div>
        ) : prepBatches.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
              <CameraIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              No batch logs found
            </p>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              {search || selectedRawItemId || selectedPrepId || onlyWastage
                ? 'Try clearing or modifying your search filters above.'
                : 'When chefs and staff execute kitchen preps with yield quantities or wastage trimmings, full logs and photo evidence will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-950/80 border-b border-stone-200 dark:border-stone-800 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Prep Recipe</th>
                  <th className="py-3 px-4">Raw Ingredient</th>
                  <th className="py-3 px-4">Chef / Staff</th>
                  <th className="py-3 px-4 text-right">Raw Input</th>
                  <th className="py-3 px-4 text-right">Actual Yield</th>
                  <th className="py-3 px-4 text-right">Scrap / Wastage</th>
                  <th className="py-3 px-4">Reason / Remarks</th>
                  <th className="py-3 px-4 text-center">Photo Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {prepBatches.map((b) => {
                  const wastePercent =
                    b.rawInputQuantity > 0
                      ? ((b.wastageQuantity / b.rawInputQuantity) * 100).toFixed(1)
                      : 0;

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition"
                    >
                      <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                        {b.createdAt
                          ? new Date(b.createdAt).toLocaleString([], {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : '—'}
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900 dark:text-white">
                        {b.prepDefinitionName || 'Kitchen Prep'}
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                        {b.rawItemName || '—'}
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                        {b.preparedByName || 'Staff'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-stone-700 dark:text-stone-200">
                        {Number(b.rawInputQuantity).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                        {Number(b.actualYieldQuantity).toFixed(2)}{' '}
                        <span className="text-[10px] font-normal text-stone-400">
                          {b.outputUomSymbol || ''}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        {Number(b.wastageQuantity) > 0 ? (
                          <div>
                            <span className="text-rose-500">
                              {Number(b.wastageQuantity).toFixed(2)}
                            </span>
                            <span className="block text-[10px] text-stone-400 font-normal">
                              ({wastePercent}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-400 font-normal">0.00</span>
                        )}
                      </td>
                      <td
                        className="py-3 px-4 text-stone-500 max-w-xs truncate"
                        title={b.wastageReason || ''}
                      >
                        {b.wastageReason ? (
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
                            {b.wastageReason}
                          </span>
                        ) : (
                          <span className="text-stone-400 italic">None logged</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {b.wastageImageUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveEvidenceModal({ batch: b, type: 'wastage' })
                              }
                              title="Inspect Wastage Proof"
                              className="relative w-8 h-8 rounded-lg overflow-hidden border border-rose-300 dark:border-rose-900 group hover:ring-2 hover:ring-rose-500 transition"
                            >
                              <img
                                src={sanitizeUrl(b.wastageImageUrl)}
                                alt="Waste Proof"
                                className="w-full h-full object-cover group-hover:scale-110 transition"
                              />
                            </button>
                          )}

                          {b.prepImageUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveEvidenceModal({ batch: b, type: 'prep' })
                              }
                              title="Inspect Preparation Proof"
                              className="relative w-8 h-8 rounded-lg overflow-hidden border border-amber-300 dark:border-amber-900 group hover:ring-2 hover:ring-amber-500 transition"
                            >
                              <img
                                src={sanitizeUrl(b.prepImageUrl)}
                                alt="Prep Proof"
                                className="w-full h-full object-cover group-hover:scale-110 transition"
                              />
                            </button>
                          )}

                          {!b.wastageImageUrl && !b.prepImageUrl && (
                            <span className="text-stone-400 text-[11px]">—</span>
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

        {/* Server Pagination Footer */}
        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/40 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong>{(page - 1) * pageSize + 1}</strong> –{' '}
                <strong>{Math.min(page * pageSize, total)}</strong> of <strong>{total}</strong>{' '}
                records
              </span>
              <span className="text-stone-300 dark:text-stone-700">|</span>
              <div className="flex items-center gap-1.5">
                <span>Per page:</span>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="appearance-none pl-2.5 pr-6 py-1 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <ChevronDownIcon className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none stroke-[2]" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="px-2 font-bold text-stone-700 dark:text-stone-300">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                <span>Next</span>
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <EvidenceLightboxModal
        isOpen={Boolean(activeEvidenceModal)}
        batch={activeEvidenceModal?.batch ?? null}
        type={activeEvidenceModal?.type ?? 'wastage'}
        onClose={() => setActiveEvidenceModal(null)}
      />
    </div>
  );
};
