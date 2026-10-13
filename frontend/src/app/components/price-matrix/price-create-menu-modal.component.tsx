import React from 'react';
import Modal from '@/components/Modal';
import { FormInput, FormTextarea, FormSelect } from '@/components/FormFields';
import { PlusIcon } from '@heroicons/react/24/outline';

interface PriceCreateMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  createFormData: {
    name: string;
    description: string;
    status: string;
    isBaseMenu: boolean;
  };
  setCreateFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    status: string;
    isBaseMenu: boolean;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  menusCount: number;
}

export const PriceCreateMenuModal: React.FC<PriceCreateMenuModalProps> = ({
  isOpen,
  onClose,
  createFormData,
  setCreateFormData,
  onSubmit,
  isSubmitting,
  menusCount,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Menu"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormInput
          label="Menu Name"
          placeholder="e.g. Lunch Specials, Weekend Brunch, UberEats"
          value={createFormData.name}
          onChange={(e: any) => setCreateFormData({ ...createFormData, name: e.target.value })}
          required
        />

        <FormTextarea
          label="Description (Optional)"
          placeholder="Optional notes or details for this menu"
          value={createFormData.description}
          onChange={(e: any) => setCreateFormData({ ...createFormData, description: e.target.value })}
        />

        <FormSelect
          label="Status"
          value={createFormData.status}
          onChange={(e: any) => setCreateFormData({ ...createFormData, status: e.target.value })}
          options={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
          ]}
        />

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          <p>
            ★ <span className="font-semibold text-slate-700 dark:text-slate-300">Note:</span> New menus are created as standard menus. You can designate this menu as the branch Base Menu anytime using the star (★) action button.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-md"
        >
          <PlusIcon className="w-4 h-4" />
          {isSubmitting ? 'Creating Menu...' : 'Create Menu'}
        </button>
      </form>
    </Modal>
  );
};
