import React from 'react';
import Modal from '@/components/Modal';
import { FormInput, FormTextarea } from '@/components/FormFields';
import { Button } from '@/atomic/atm.button';
import type { FeaturedSectionModel } from '@/app/models/featured.model';

export interface FeaturedFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSection: FeaturedSectionModel | null;
  formData: {
    title: string;
    description: string;
    products: (number | string)[];
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const FeaturedFormModal: React.FC<FeaturedFormModalProps> = ({
  isOpen,
  onClose,
  editingSection,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSection ? 'Edit Featured Banner' : 'Create Featured Banner'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormInput
          label="Banner Title"
          placeholder="e.g. Chef's Daily Special, Weekend Highlights"
          value={formData.title}
          onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <FormTextarea
          label="Description / Subtitle"
          placeholder="e.g. Savor our signature handcrafted artisan dishes available this week."
          value={formData.description}
          onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Start Date (Optional)"
            type="date"
            value={formData.startDate}
            onChange={(e: any) => setFormData({ ...formData, startDate: e.target.value })}
          />
          <FormInput
            label="End Date (Optional)"
            type="date"
            value={formData.endDate}
            onChange={(e: any) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 rounded text-amber-500 accent-amber-500 focus:ring-amber-500"
          />
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            Publish and make visible on customer QR menu
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
          {editingSection ? 'Save Banner Changes' : 'Create Banner'}
        </Button>
      </form>
    </Modal>
  );
};
