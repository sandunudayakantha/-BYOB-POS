import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/Modal';
import { FormInput } from '@/components/FormFields';
import { Button } from '@/atomic/atm.button';

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
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                Select Product
              </label>
              <div className="relative">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700/80 bg-white dark:bg-stone-900/90 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  required
                >
                  {availableProducts.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                      {p.name} {p.categoryName ? `(${p.categoryName})` : ''}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400">
                  <ChevronDownIcon className="w-4 h-4 stroke-[2]" />
                </div>
              </div>
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

            <Button
              type="submit"
              variant="primary"
              rounded="full"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className="w-full py-3 font-bold text-sm shadow-none"
            >
              Add to Menu
            </Button>
          </>
        )}
      </form>
    </Modal>
  );
};
