import React from 'react';
import Modal from '@/components/Modal';
import { FormInput, FormTextarea, FormSelect } from '@/components/FormFields';
import { Button } from '@/atomic/atm.button';
import type { MenuModel } from '@/app/models/menu.model';

export interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMenu: MenuModel | null;
  formData: {
    name: string;
    description: string;
    status: 'ACTIVE' | 'INACTIVE';
    isBaseMenu: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const MenuFormModal: React.FC<MenuFormModalProps> = ({
  isOpen,
  onClose,
  editingMenu,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMenu ? 'Edit Menu' : 'Create Menu Variant'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormInput
          label="Menu Name"
          placeholder="e.g. Dine-In Standard, UberEats Peak, Happy Hour"
          value={formData.name}
          onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <FormTextarea
          label="Description"
          placeholder="Optional notes or operational schedule for this menu..."
          value={formData.description}
          onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
        />
        <FormSelect
          label="Status"
          value={formData.status}
          onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
          options={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
          ]}
        />
        <label className="flex items-center gap-3 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={formData.isBaseMenu}
            onChange={(e) => setFormData({ ...formData, isBaseMenu: e.target.checked })}
            className="w-4 h-4 rounded text-amber-500 accent-amber-500 focus:ring-amber-500"
          />
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            Set as Default Base Menu for this Branch
          </span>
        </label>
        <Button
          type="submit"
          variant="primary"
          rounded="full"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="w-full py-3 font-bold text-sm shadow-none"
        >
          {editingMenu ? 'Save Changes' : 'Create Menu'}
        </Button>
      </form>
    </Modal>
  );
};
