import React from 'react';
import type { KitchenPrepDefinitionModel } from '@/app/models/inventory.model';
import { Button } from '@/atomic/atm.button';
import { BeakerIcon, PencilSquareIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export interface KitchenPrepsTabProps {
  prepDefinitions: KitchenPrepDefinitionModel[];
  isLoading: boolean;
  onEditPrep: (prep: KitchenPrepDefinitionModel) => void;
  onLogBatch: (prep: KitchenPrepDefinitionModel) => void;
  onOpenAddPrep?: () => void;
}

export const KitchenPrepsTab: React.FC<KitchenPrepsTabProps> = ({
  prepDefinitions,
  isLoading,
  onEditPrep,
  onLogBatch,
  onOpenAddPrep,
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="font-extrabold text-lg text-stone-900 dark:text-white">Admin Prep Sub-Recipes</h3>
          <p className="text-xs text-stone-500">
            All intermediate preps configured under raw materials, including yield percentages, photo evidence, and wastage rules.
          </p>
        </div>
        {onOpenAddPrep && (
          <Button
            type="button"
            variant="primary"
            rounded="full"
            onClick={onOpenAddPrep}
            className="flex items-center gap-2 py-2 px-4 font-bold text-xs shadow-none"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            <span>Define Prep</span>
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search prep sub-recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-stone-400">Loading kitchen preps...</div>
      ) : filteredPreps.length === 0 ? (
        <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700">
          No prep sub-recipes found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-stone-200/80 dark:border-white/[0.07] bg-white/75 dark:bg-stone-900/40 backdrop-blur-xl shadow-xl shadow-black/5">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100/80 dark:bg-stone-950/80 border-b border-stone-200/80 dark:border-white/[0.06] text-stone-600 dark:text-stone-300 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Prep Sub-Recipe</th>
                <th className="py-3.5 px-4">Base Raw Material</th>
                <th className="py-3.5 px-4 text-right">Expected Yield</th>
                <th className="py-3.5 px-4 text-right">Ready Stock</th>
                <th className="py-3.5 px-4">Governance Rules</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/[0.05]">
              {filteredPreps.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onEditPrep(row)}
                  className="cursor-pointer hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition group"
                >
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-stone-900 dark:text-white block group-hover:text-amber-500 transition">{row.name}</span>
                    {row.portionSizeValue && (
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        ⚖️ {Number(row.portionSizeValue)} {row.portionSizeUomSymbol || 'g'} / {row.uomSymbol || 'portion'}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300 font-medium">
                    {row.baseRawItemName || 'Direct Raw Item'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-stone-700 dark:text-stone-200">
                    {Number(row.expectedYieldPercent).toFixed(0)}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-amber-600 dark:text-amber-400">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPrep(row);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 font-bold text-xs border border-stone-200 dark:border-stone-700 transition active:scale-95"
                      >
                        <PencilSquareIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLogBatch(row);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-none transition active:scale-95"
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
