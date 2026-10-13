import React from 'react';
import Modal from '@/components/Modal';
import { FormSelect } from '@/components/FormFields';
import { CalculatorIcon } from '@heroicons/react/24/outline';

interface PriceAdjustModalProps {
  adjustModalMenu: any;
  onClose: () => void;
  menus: any[];
  adjustPercentage: string;
  setAdjustPercentage: (val: string) => void;
  adjustSourceMode: 'BASE_MENU' | 'CURRENT_MENU';
  setAdjustSourceMode: (val: 'BASE_MENU' | 'CURRENT_MENU') => void;
  onAdjustSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  onSelectMenu: (menu: any) => void;
}

export const PriceAdjustModal: React.FC<PriceAdjustModalProps> = ({
  adjustModalMenu,
  onClose,
  menus,
  adjustPercentage,
  setAdjustPercentage,
  adjustSourceMode,
  setAdjustSourceMode,
  onAdjustSubmit,
  isPending,
  onSelectMenu,
}) => {
  return (
    <Modal
      isOpen={!!adjustModalMenu}
      onClose={onClose}
      title={`Percentage Price Adjustment: "${adjustModalMenu?.name}"`}
    >
      {adjustModalMenu && (
        <form onSubmit={onAdjustSubmit} className="space-y-4">
          <FormSelect
            label="Target Menu for Adjustment"
            value={adjustModalMenu?._id || adjustModalMenu?.id}
            onChange={(e) => {
              const selected = menus.find((m) => String(m._id || m.id) === String(e.target.value));
              if (selected) onSelectMenu(selected);
            }}
            options={menus.map((m) => ({
              value: m._id || m.id,
              label: `${m.name} ${m.isBaseMenu ? '(Base Menu ★)' : ''}`,
            }))}
            required
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Adjustment Percentage (%)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 15 for +15%, -10 for -10%"
              value={adjustPercentage}
              onChange={(e) => setAdjustPercentage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Calculation Baseline Source
            </label>

            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="sourceModeMatrix"
                  value="BASE_MENU"
                  checked={adjustSourceMode === 'BASE_MENU'}
                  onChange={() => setAdjustSourceMode('BASE_MENU')}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span>Calculate relative to <strong>Base Menu</strong> prices (Recommended)</span>
              </label>

              <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="sourceModeMatrix"
                  value="CURRENT_MENU"
                  checked={adjustSourceMode === 'CURRENT_MENU'}
                  onChange={() => setAdjustSourceMode('CURRENT_MENU')}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span>Calculate relative to <strong>Current Menu</strong> prices</span>
              </label>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
            <span className="font-bold text-indigo-900 dark:text-indigo-300 block">Sample Price Math Preview:</span>
            <p className="text-slate-600 dark:text-slate-400">
              Baseline Item Price: <span className="font-bold text-slate-900 dark:text-white">100.00 LKR</span>
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Adjustment: <span className="font-bold text-emerald-600 dark:text-emerald-400">{Number(adjustPercentage) >= 0 ? `+${adjustPercentage}` : adjustPercentage}%</span>
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              New Calculated Price: <span className="font-black text-indigo-600 dark:text-indigo-400">{(100 * (1 + Number(adjustPercentage || 0) / 100)).toFixed(2)} LKR</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-md"
          >
            <CalculatorIcon className="w-4 h-4" />
            {isPending ? 'Calculating & Updating Prices...' : `Apply ${Number(adjustPercentage) >= 0 ? '+' : ''}${adjustPercentage}% Price Change`}
          </button>
        </form>
      )}
    </Modal>
  );
};
