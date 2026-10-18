import React from 'react';
import Modal from '@/components/Modal';
import { FormInput } from '@/components/FormFields';
import type { MenuItemModel } from '@/app/models/menu.model';

export interface EditMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem: MenuItemModel | null;
  editPrice: string;
  setEditPrice: (price: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const EditMenuItemModal: React.FC<EditMenuItemModalProps> = ({
  isOpen,
  onClose,
  editItem,
  editPrice,
  setEditPrice,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Menu Item: ${editItem?.productName || ''}`}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormInput
          label="Menu Price (LKR)"
          type="number"
          step="0.01"
          placeholder="e.g. 1450.00"
          value={editPrice}
          onChange={(e: any) => setEditPrice(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Update Price'}
        </button>
      </form>
    </Modal>
  );
};
