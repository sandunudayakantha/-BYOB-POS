import React from 'react';
import Modal from '@/components/Modal';
import { Button } from '@/atomic/atm.button';
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
          <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl text-xs space-y-1 border border-stone-200 dark:border-stone-800">
            <p className="text-stone-500 dark:text-stone-400">
              Menu Column: <strong className="text-stone-900 dark:text-stone-100">{editingCell.menuName}</strong>
            </p>
            {basePriceForCell !== undefined && baseMenu?._id !== editingCell.menuId && (
              <p className="text-stone-500 dark:text-stone-400">
                Base Menu Reference Price: <strong className="text-amber-600 dark:text-amber-400">LKR {Number(basePriceForCell).toFixed(2)}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="flex-1 py-2.5 text-sm"
              icon={PencilSquareIcon}
            >
              {isSaving ? 'Saving...' : editingCell.menuItemId ? 'Update Price' : 'Add to Menu'}
            </Button>

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
