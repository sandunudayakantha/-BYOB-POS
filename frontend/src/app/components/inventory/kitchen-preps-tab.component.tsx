import React from 'react';
import type { KitchenPrepDefinitionModel } from '@/app/models/inventory.model';
import { BeakerIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

export interface KitchenPrepsTabProps {
  prepDefinitions: KitchenPrepDefinitionModel[];
  isLoading: boolean;
  onEditPrep: (prep: KitchenPrepDefinitionModel) => void;
  onLogBatch: (prep: KitchenPrepDefinitionModel) => void;
}

export const KitchenPrepsTab: React.FC<KitchenPrepsTabProps> = ({
  prepDefinitions,
  isLoading,
  onEditPrep,
  onLogBatch,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredPreps = React.useMemo(() => {
    if (!searchTerm.trim()) return prepDefinitions;
    const term = searchTerm.toLowerCase();
    return prepDefinitions.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.baseRawItemName && p.baseRawItemName.toLowerCase().includes(term))
    );
  }, [prepDefinitions, searchTerm]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Admin Prep Sub-Recipes</h3>
        <p className="text-xs text-slate-500">
          All intermediate preps configured under raw materials, including yield percentages, photo evidence, and wastage rules.
        </p>
      </div>

      <div className="relative max-w-sm">
        <input
          type="text"
          placeholder="Search prep sub-recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-3 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading kitchen preps...</div>
      ) : filteredPreps.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          No prep sub-recipes found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Prep Sub-Recipe</th>
                <th className="py-3.5 px-4">Base Raw Material</th>
                <th className="py-3.5 px-4 text-right">Expected Yield</th>
                <th className="py-3.5 px-4 text-right">Ready Stock</th>
                <th className="py-3.5 px-4">Governance Rules</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPreps.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block">{row.name}</span>
                    {row.portionSizeValue && (
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        ⚖️ {Number(row.portionSizeValue)} {row.portionSizeUomSymbol || 'g'} / {row.uomSymbol || 'portion'}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    {row.baseRawItemName || 'Direct Raw Item'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-700 dark:text-slate-200">
                    {Number(row.expectedYieldPercent).toFixed(0)}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                    {Number(row.currentStock).toFixed(2)} {row.uomSymbol || ''}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {row.requiresImageEvidence && (
                        <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
                          📷 Photo Proof
                        </span>
                      )}
                      {row.trackWastage && (
                        <span className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                          🗑️ Wastage Tracked
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditPrep(row)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs border border-slate-200 dark:border-slate-700 transition"
                      >
                        <PencilSquareIcon className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onLogBatch(row)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                      >
                        <BeakerIcon className="w-3.5 h-3.5" />
                        <span>Log Batch</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
