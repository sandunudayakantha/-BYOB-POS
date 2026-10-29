import React from 'react';
import Modal from '@/components/Modal';
import { FormInput } from '@/components/FormFields';
import { Button } from '@/atomic/atm.button';
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
        <Button
          type="submit"
          variant="primary"
          rounded="full"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="w-full py-3 font-bold text-sm shadow-none"
        >
          Update Price
        </Button>
      </form>
    </Modal>
  );
};
