import React from 'react';
import Modal from '@/components/Modal';
import { FormInput } from '@/components/FormFields';

export interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableProducts: any[];
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  customPrice: string;
  setCustomPrice: (price: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({
  isOpen,
  onClose,
  availableProducts,
  selectedProductId,
  setSelectedProductId,
  customPrice,
  setCustomPrice,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Product to Menu">
      <form onSubmit={onSubmit} className="space-y-4">
        {availableProducts.length === 0 ? (
          <p className="text-sm text-slate-500">
            All available branch catalog products are already added to this menu.
          </p>
        ) : (
          <>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Select Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                {availableProducts.map((p) => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.name} {p.categoryName ? `(${p.categoryName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <FormInput
              label="Menu Price (LKR)"
              type="number"
              step="0.01"
              placeholder="e.g. 1450.00"
              value={customPrice}
              onChange={(e: any) => setCustomPrice(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add to Menu'}
            </button>
          </>
        )}
      </form>
    </Modal>
  );
};
