import React from 'react';
import Modal from '@/components/Modal';
import { FormSelect } from '@/components/FormFields';
import type { BranchModel } from '@/app/models/branch.model';

export interface BranchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: BranchModel[];
  importData: {
    sourceBranchId: string;
    targetBranchId: string;
    includeCategoriesAndProducts: boolean;
    includeMenus: boolean;
    includeFeatured: boolean;
  };
  setImportData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const BranchImportModal: React.FC<BranchImportModalProps> = ({
  isOpen,
  onClose,
  branches,
  importData,
  setImportData,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import / Copy Catalog Between Branches">
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-xs text-slate-500">
          Replicate menu categories, dishes, prices, and banners into another branch instantly.
        </p>

        <FormSelect
          label="Source Branch (Copy From)"
          value={importData.sourceBranchId}
          onChange={(e: any) => setImportData({ ...importData, sourceBranchId: e.target.value })}
          options={[
            { value: '', label: 'Select Source Branch' },
            ...branches.map((b) => ({ value: b.id, label: `${b.name} ${b.isMain ? '(Main)' : ''}` })),
          ]}
          required
        />

        <FormSelect
          label="Target Branch (Copy Into)"
          value={importData.targetBranchId}
          onChange={(e: any) => setImportData({ ...importData, targetBranchId: e.target.value })}
          options={[
            { value: '', label: 'Select Target Branch' },
            ...branches
              .filter((b) => b.id !== importData.sourceBranchId)
              .map((b) => ({ value: b.id, label: b.name })),
          ]}
          required
        />

        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={importData.includeCategoriesAndProducts}
              onChange={(e) =>
                setImportData({ ...importData, includeCategoriesAndProducts: e.target.checked })
              }
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            Include Categories & Products
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={importData.includeMenus}
              onChange={(e) => setImportData({ ...importData, includeMenus: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            Include Menus & Pricing Configurations
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={importData.includeFeatured}
              onChange={(e) => setImportData({ ...importData, includeFeatured: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            Include Featured Banners
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !importData.sourceBranchId || !importData.targetBranchId}
          className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Importing Catalog...' : 'Start Catalog Copy'}
        </button>
      </form>
    </Modal>
  );
};
