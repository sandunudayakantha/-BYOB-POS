import React from 'react';
import Modal from '@/components/Modal';
import { FormInput, FormSelect } from '@/components/FormFields';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface PriceFillModalProps {
  fillModalMenu: any;
  onClose: () => void;
  menus: any[];
  fillPercentage: string;
  setFillPercentage: (val: string) => void;
  fillOverwrite: boolean;
  setFillOverwrite: (val: boolean) => void;
  onFillSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  onSelectMenu: (menu: any) => void;
}

export const PriceFillModal: React.FC<PriceFillModalProps> = ({
  fillModalMenu,
  onClose,
  menus,
  fillPercentage,
  setFillPercentage,
  fillOverwrite,
  setFillOverwrite,
  onFillSubmit,
  isPending,
  onSelectMenu,
}) => {
  return (
    <Modal
      isOpen={!!fillModalMenu}
      onClose={onClose}
      title={`Auto-Fill / Sync Products into "${fillModalMenu?.name}"`}
    >
      {fillModalMenu && (
        <form onSubmit={onFillSubmit} className="space-y-4">
          <FormSelect
            label="Select Target Menu to Populate"
            value={fillModalMenu?._id || fillModalMenu?.id}
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

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Instantly populate missing catalog products from the <strong>Base Menu</strong> into <strong>"{fillModalMenu.name}"</strong> with an optional percentage markup.
          </p>

          <FormInput
            label="Percentage Markup on Base Price (%)"
            type="number"
            step="0.1"
            placeholder="e.g. 15 for +15% markup, 0 for same base price"
            value={fillPercentage}
            onChange={(e: any) => setFillPercentage(e.target.value)}
            required
          />

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={fillOverwrite}
                onChange={(e) => setFillOverwrite(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <span>Overwrite existing product prices in this menu</span>
            </label>
            <p className="text-[11px] text-slate-400 mt-1 pl-7">
              Leave unchecked to fill missing products only while preserving existing item prices.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
            <span className="font-bold text-emerald-900 dark:text-emerald-300 block">Auto-Fill Calculation Preview:</span>
            <p className="text-slate-600 dark:text-slate-400">
              Base Menu Item Price: <span className="font-bold text-slate-900 dark:text-white">1,000.00 LKR</span>
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Markup Applied: <span className="font-bold text-emerald-600 dark:text-emerald-400">+{fillPercentage}%</span>
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              New Target Menu Item Price: <span className="font-black text-emerald-600 dark:text-emerald-400">{(1000 * (1 + Number(fillPercentage || 0) / 100)).toFixed(2)} LKR</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-md"
          >
            <SparklesIcon className="w-4 h-4" />
            {isPending ? 'Populating Menu Products...' : `Populate "${fillModalMenu.name}" (+${fillPercentage}%)`}
          </button>
        </form>
      )}
    </Modal>
  );
};
