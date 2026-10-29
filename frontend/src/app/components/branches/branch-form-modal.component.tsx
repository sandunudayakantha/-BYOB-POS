import React from 'react';
import Modal from '@/components/Modal';
import { FormInput } from '@/components/FormFields';
import { Button } from '@/atomic/atm.button';
import { PhotoIcon } from '@heroicons/react/24/outline';
import type { BranchModel } from '@/app/models/branch.model';

export interface BranchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBranch: BranchModel | null;
  formData: {
    name: string;
    address: string;
    phone: string;
    logo: string;
    coverImage: string;
    isMain: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  logoPreview: string;
  setLogoPreview: (url: string) => void;
  coverFile: File | null;
  setCoverFile: (file: File | null) => void;
  coverPreview: string;
  setCoverPreview: (url: string) => void;
  handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: Record<string, string>;
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const BranchFormModal: React.FC<BranchFormModalProps> = ({
  isOpen,
  onClose,
  editingBranch,
  formData,
  setFormData,
  logoPreview,
  coverPreview,
  handleLogoChange,
  handleCoverChange,
  errors = {},
  setErrors,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingBranch ? 'Edit Branch & Branding' : 'Create Branch'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormInput
          label="Branch Name"
          placeholder="e.g. Colombo Central Outlet"
          value={formData.name}
          error={errors.name}
          onChange={(e: any) => {
            setFormData({ ...formData, name: e.target.value });
            if (setErrors && errors.name) {
              setErrors((prev) => ({ ...prev, name: '' }));
            }
          }}
          required
        />
        <FormInput
          label="Address"
          placeholder="e.g. 123 Galle Road, Colombo 03"
          value={formData.address}
          error={errors.address}
          onChange={(e: any) => {
            setFormData({ ...formData, address: e.target.value });
            if (setErrors && errors.address) {
              setErrors((prev) => ({ ...prev, address: '' }));
            }
          }}
          required
        />
        <FormInput
          label="Phone Number"
          placeholder="e.g. +94 11 234 5678"
          value={formData.phone}
          error={errors.phone}
          onChange={(e: any) => {
            setFormData({ ...formData, phone: e.target.value });
            if (setErrors && errors.phone) {
              setErrors((prev) => ({ ...prev, phone: '' }));
            }
          }}
          required
        />

        {/* Logo upload */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
            Branch / Brand Logo (Circular)
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 overflow-hidden flex items-center justify-center">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <PhotoIcon className="w-6 h-6 text-stone-400" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-600 dark:file:bg-amber-500/20 dark:file:text-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Cover banner upload */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
            Header Banner Image (Wide Landscape)
          </label>
          <div className="flex flex-col gap-2">
            <div className="w-full h-24 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 overflow-hidden flex items-center justify-center">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <PhotoIcon className="w-8 h-8 text-stone-400" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-600 dark:file:bg-amber-500/20 dark:file:text-amber-400 cursor-pointer"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          rounded="full"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="w-full py-3 font-bold text-sm shadow-none"
        >
          {editingBranch ? 'Save Branch Changes' : 'Create Branch'}
        </Button>
      </form>
    </Modal>
  );
};
