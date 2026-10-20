import React from 'react';
import type { KitchenPrepBatchModel, InventoryItemModel } from '@/app/models/inventory.model';
import { TrashIcon } from '@heroicons/react/24/outline';
import { sanitizeUrl } from '@/utils/url';

export interface WastageLogSectionProps {
  batches: KitchenPrepBatchModel[];
  detailItem: InventoryItemModel;
}

export const WastageLogSection: React.FC<WastageLogSectionProps> = ({ batches, detailItem }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 10;

  const totalRawWastage = batches.reduce((acc, b) => acc + (b.wastageQuantity || 0), 0);
  const totalRawInputUsed = batches.reduce((acc, b) => acc + (b.rawInputQuantity || 0), 0);
  const avgYieldPercent = totalRawInputUsed > 0 
    ? (((totalRawInputUsed - totalRawWastage) / totalRawInputUsed) * 100).toFixed(1)
    : null;

  const filteredBatches = React.useMemo(() => {
    if (!searchTerm.trim()) return batches;
    const term = searchTerm.toLowerCase();
    return batches.filter(
      (b) =>
        (b.prepDefinitionName && b.prepDefinitionName.toLowerCase().includes(term)) ||
        (b.preparedByName && b.preparedByName.toLowerCase().includes(term)) ||
        (b.wastageReason && b.wastageReason.toLowerCase().includes(term))
    );
  }, [batches, searchTerm]);

  const totalPages = Math.ceil(filteredBatches.length / PAGE_SIZE) || 1;
  const currentP = Math.min(page, totalPages);
  const paginatedRows = filteredBatches.slice((currentP - 1) * PAGE_SIZE, currentP * PAGE_SIZE);

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <TrashIcon className="w-4 h-4 text-rose-500" />
            <span>Preparation Wastage & Trimmings Log ({batches.length})</span>
          </h4>
          <p className="text-xs text-slate-400">
            Live trimmings and scraps recorded by kitchen staff during prep batch executions from {detailItem.name}
          </p>
        </div>

        {batches.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              Total Wastage: <strong>{totalRawWastage.toFixed(2)} {detailItem.uomSymbol}</strong>
            </span>
            {avgYieldPercent && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                Efficiency: <strong>{avgYieldPercent}%</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {batches.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-xs">
          No preparation batches logged for {detailItem.name} yet. When chefs execute batches under defined preps, all yield and wastage logs will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="max-w-xs">
            <input
              type="text"
              placeholder="Search wastage logs by recipe, chef, reason..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedRows.map((b) => {
                  const wastePercent = b.rawInputQuantity > 0 ? ((b.wastageQuantity / b.rawInputQuantity) * 100).toFixed(1) : 0;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-slate-500">
                        {b.createdAt ? new Date(b.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {b.prepDefinitionName || 'Kitchen Prep'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {b.preparedByName || 'Staff'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-200">
                        {Number(b.rawInputQuantity).toFixed(2)} {detailItem.uomSymbol}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {Number(b.actualYieldQuantity).toFixed(2)} {b.outputUomSymbol || detailItem.uomSymbol}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-500">
                        <span>{Number(b.wastageQuantity).toFixed(2)} {detailItem.uomSymbol}</span>
                        {b.rawInputQuantity > 0 && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            ({wastePercent}%)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={b.wastageReason || ''}>
                        {b.wastageReason || <span className="text-slate-400 italic">None logged</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {b.wastageImageUrl ? (
                            <a
                              href={sanitizeUrl(b.wastageImageUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View Wastage Photo"
                              className="w-8 h-8 rounded-lg overflow-hidden border border-rose-300 dark:border-rose-900 block hover:opacity-80 transition"
                            >
                              <img src={sanitizeUrl(b.wastageImageUrl)} alt="Waste Proof" className="w-full h-full object-cover" />
                            </a>
                          ) : b.prepImageUrl ? (
                            <a
                              href={sanitizeUrl(b.prepImageUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View Prep Photo"
                              className="w-8 h-8 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 block hover:opacity-80 transition"
                            >
                              <img src={sanitizeUrl(b.prepImageUrl)} alt="Prep Proof" className="w-full h-full object-cover" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Showing {(currentP - 1) * PAGE_SIZE + 1} - {Math.min(currentP * PAGE_SIZE, filteredBatches.length)} of {filteredBatches.length} records</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentP === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
                >
                  Prev
                </button>
                <span className="font-bold text-slate-700 dark:text-slate-300">{currentP} / {totalPages}</span>
                <button
                  type="button"
                  disabled={currentP === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
