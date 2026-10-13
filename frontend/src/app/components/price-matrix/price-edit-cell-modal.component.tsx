import React from 'react';
import Modal from '@/components/Modal';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

interface PriceEditCellModalProps {
  editingCell: any;
  onClose: () => void;
  editPriceInput: string;
  setEditPriceInput: (val: string) => void;
  basePriceForCell?: number;
  baseMenu?: any;
  onSavePrice: (e: React.FormEvent) => void;
  onRemoveItem: (menuItemId: string) => void;
  isSaving: boolean;
  isRemoving: boolean;
}

export const PriceEditCellModal: React.FC<PriceEditCellModalProps> = ({
  editingCell,
  onClose,
  editPriceInput,
  setEditPriceInput,
  basePriceForCell,
  baseMenu,
  onSavePrice,
  onRemoveItem,
  isSaving,
  isRemoving,
}) => {
  return (
    <Modal
      isOpen={!!editingCell}
      onClose={onClose}
      title={`Set Price: "${editingCell?.productName}"`}
    >
      {editingCell && (
        <form onSubmit={onSavePrice} className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs space-y-1">
            <p className="text-slate-500">
              Menu Column: <strong className="text-slate-900 dark:text-white">{editingCell.menuName}</strong>
            </p>
            {basePriceForCell !== undefined && baseMenu?._id !== editingCell.menuId && (
              <p className="text-slate-500">
                Base Menu Reference Price: <strong className="text-amber-600 dark:text-amber-400">LKR {Number(basePriceForCell).toFixed(2)}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Menu Item Price (LKR)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="e.g. 1250.00"
              value={editPriceInput}
              onChange={(e) => setEditPriceInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <PencilSquareIcon className="w-4 h-4" />
              {isSaving ? 'Saving...' : editingCell.menuItemId ? 'Update Price' : 'Add to Menu'}
            </button>

            {editingCell.menuItemId && (
              <button
                type="button"
                onClick={() => onRemoveItem(editingCell.menuItemId)}
                disabled={isRemoving}
                className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-xs transition"
              >
                Remove
              </button>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
};
