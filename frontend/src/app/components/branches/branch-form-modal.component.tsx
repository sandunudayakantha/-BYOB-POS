import React from 'react';
import Modal from '@/components/Modal';
import { FormInput } from '@/components/FormFields';
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
          onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <FormInput
          label="Address"
          placeholder="e.g. 123 Galle Road, Colombo 03"
          value={formData.address}
          onChange={(e: any) => setFormData({ ...formData, address: e.target.value })}
          required
        />
        <FormInput
          label="Phone Number"
          placeholder="e.g. +94 11 234 5678"
          value={formData.phone}
          onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
          required
        />

        {/* Logo upload */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Branch / Brand Logo (Circular)
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <PhotoIcon className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950/60 dark:file:text-emerald-400"
            />
          </div>
        </div>

        {/* Cover banner upload */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Header Banner Image (Wide Landscape)
          </label>
          <div className="flex flex-col gap-2">
            <div className="w-full h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <PhotoIcon className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950/60 dark:file:text-emerald-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : editingBranch ? 'Save Branch Changes' : 'Create Branch'}
        </button>
      </form>
    </Modal>
  );
};
