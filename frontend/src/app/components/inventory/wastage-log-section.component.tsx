import React, { useState } from 'react';
import type { InventoryItemModel, KitchenPrepBatchModel } from '@/app/models/inventory.model';
import { usePrepBatchesUseCase } from '@/app/domain/inventory/use-prep-batches.use-case';
import { TrashIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { sanitizeUrl } from '@/utils/url';
import { EvidenceLightboxModal } from './evidence-lightbox-modal.component';

export interface WastageLogSectionProps {
  branchId: number;
  detailItem: InventoryItemModel;
  totalWastage?: number;
}

export const WastageLogSection: React.FC<WastageLogSectionProps> = ({
  branchId,
  detailItem,
  totalWastage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<{
    batch: KitchenPrepBatchModel;
    type: 'wastage' | 'prep';
  } | null>(null);
  const PAGE_SIZE = 10;

  const { prepBatches, total, isLoading, isFetching } = usePrepBatchesUseCase({
    branchId,
    rawItemId: detailItem.id,
    page,
    limit: PAGE_SIZE,
    search: searchTerm.trim() ? searchTerm.trim() : null,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageWastage = prepBatches.reduce((acc, b) => acc + (b.wastageQuantity || 0), 0);
  const pageInput = prepBatches.reduce((acc, b) => acc + (b.rawInputQuantity || 0), 0);
  const avgYieldPercent =
    pageInput > 0
      ? (((pageInput - pageWastage) / pageInput) * 100).toFixed(1)
      : null;

  const displayWastage = totalWastage !== undefined ? totalWastage : pageWastage;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h4 className="font-extrabold text-sm text-stone-900 dark:text-white flex items-center gap-2">
            <TrashIcon className="w-4 h-4 text-rose-500" />
            <span>Preparation Wastage & Trimmings Log ({total})</span>
            {isFetching && !isLoading && (
              <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-amber-500" />
            )}
          </h4>
          <p className="text-xs text-stone-400">
            Live trimmings and scraps recorded by kitchen staff during prep batch executions from {detailItem.name}
          </p>
        </div>

        {total > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              Total Wastage: <strong>{displayWastage.toFixed(2)} {detailItem.uomSymbol}</strong>
            </span>
            {avgYieldPercent && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Page Efficiency: <strong>{avgYieldPercent}%</strong>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative max-w-xs">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search wastage logs by recipe, chef, reason..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-stone-400 space-y-2">
            <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto text-amber-500" />
            <p>Loading preparation wastage logs...</p>
          </div>
        ) : total === 0 ? (
          <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 text-stone-400 text-xs">
            {searchTerm.trim()
              ? `No wastage logs found matching "${searchTerm}". Try modifying your search.`
              : `No preparation batches logged for ${detailItem.name} yet. When chefs execute batches under defined preps, all yield and wastage logs will appear here.`}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-900/80 border-b border-stone-200 dark:border-stone-800 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Prep Recipe</th>
                  <th className="py-3 px-4">Prepared By</th>
                  <th className="py-3 px-4 text-right">Raw Input</th>
                  <th className="py-3 px-4 text-right">Actual Yield</th>
                  <th className="py-3 px-4 text-right">Trimmings / Waste</th>
                  <th className="py-3 px-4">Wastage Reason</th>
                  <th className="py-3 px-4 text-center">Photo Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {prepBatches.map((b) => {
                  const wastePercent =
                    b.rawInputQuantity > 0
                      ? ((b.wastageQuantity / b.rawInputQuantity) * 100).toFixed(1)
                      : 0;
                  return (
                    <tr key={b.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-900/40 transition">
                      <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                        {b.createdAt
                          ? new Date(b.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                          : '—'}
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900 dark:text-white">
                        {b.prepDefinitionName || 'Kitchen Prep'}
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                        {b.preparedByName || 'Staff'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-stone-700 dark:text-stone-200">
                        {Number(b.rawInputQuantity).toFixed(2)} {detailItem.uomSymbol}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                        {Number(b.actualYieldQuantity).toFixed(2)} {b.outputUomSymbol || detailItem.uomSymbol}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-500">
                        <span>{Number(b.wastageQuantity).toFixed(2)} {detailItem.uomSymbol}</span>
                        {b.rawInputQuantity > 0 && (
                          <span className="block text-[10px] text-stone-400 font-normal">
                            ({wastePercent}%)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-stone-500 max-w-xs truncate" title={b.wastageReason || ''}>
                        {b.wastageReason ? (
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
                            {b.wastageReason}
                          </span>
                        ) : (
                          <span className="text-stone-400 italic">None logged</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {b.wastageImageUrl ? (
                            <button
                              type="button"
                              onClick={() => setActiveEvidenceModal({ batch: b, type: 'wastage' })}
                              title="Inspect Wastage Proof"
                              className="w-8 h-8 rounded-lg overflow-hidden border border-rose-300 dark:border-rose-900 block hover:ring-2 hover:ring-rose-500 transition"
                            >
                              <img src={sanitizeUrl(b.wastageImageUrl)} alt="Waste Proof" className="w-full h-full object-cover" />
                            </button>
                          ) : b.prepImageUrl ? (
                            <button
                              type="button"
                              onClick={() => setActiveEvidenceModal({ batch: b, type: 'prep' })}
                              title="Inspect Prep Proof"
                              className="w-8 h-8 rounded-lg overflow-hidden border border-stone-300 dark:border-stone-700 block hover:ring-2 hover:ring-amber-500 transition"
                            >
                              <img src={sanitizeUrl(b.prepImageUrl)} alt="Prep Proof" className="w-full h-full object-cover" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-stone-400">—</span>
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

        {total > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
            <span>
              Showing <strong>{(page - 1) * PAGE_SIZE + 1}</strong> –{' '}
              <strong>{Math.min(page * PAGE_SIZE, total)}</strong> of{' '}
              <strong>{total}</strong> records
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-800 disabled:opacity-30 disabled:pointer-events-none hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                Prev
              </button>
              <span className="font-bold text-stone-700 dark:text-stone-300">{page} / {totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-800 disabled:opacity-30 disabled:pointer-events-none hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <EvidenceLightboxModal
        isOpen={Boolean(activeEvidenceModal)}
        batch={activeEvidenceModal?.batch ?? null}
        type={activeEvidenceModal?.type ?? 'wastage'}
        onClose={() => setActiveEvidenceModal(null)}
      />
    </div>
  );
};
