import React, { useState, useMemo } from 'react';
import { useBranchesUseCase } from '@/app/domain/branches/use-branches.use-case';
import { useCreateBranchUseCase } from '@/app/domain/branches/use-create-branch.use-case';
import { useUpdateBranchUseCase } from '@/app/domain/branches/use-update-branch.use-case';
import { useDeleteBranchUseCase } from '@/app/domain/branches/use-delete-branch.use-case';
import { useImportCatalogUseCase } from '@/app/domain/branches/use-import-catalog.use-case';
import { buildBranchColumns } from '@/app/components/branches/branch-table-columns';
import { BranchFormModal } from '@/app/components/branches/branch-form-modal.component';
import { BranchImportModal } from '@/app/components/branches/branch-import-modal.component';
import { DataTable } from '@/atomic/obj.data-table';
import toast from 'react-hot-toast';
import type { BranchModel } from '@/app/models/branch.model';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { extractValidationErrors } from '@/utils/errors';

export const BranchesPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchModel | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importData, setImportData] = useState({
    sourceBranchId: '',
    targetBranchId: '',
    includeCategoriesAndProducts: true,
    includeMenus: true,
    includeFeatured: true,
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    logo: '',
    coverImage: '',
    isMain: false,
  });

  const { branches, isLoading } = useBranchesUseCase();
  const { createBranch, isSubmitting: isCreating } = useCreateBranchUseCase();
  const { updateBranch, isSubmitting: isUpdating } = useUpdateBranchUseCase();
  const { deleteBranch } = useDeleteBranchUseCase();
  const { importCatalog, isSubmitting: isImporting } = useImportCatalogUseCase();

  const handleOpen = (branch: BranchModel | null = null) => {
    setLogoFile(null);
    setCoverFile(null);
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        address: branch.address || '',
        phone: branch.phone || '',
        logo: branch.logo || '',
        coverImage: branch.coverImage || '',
        isMain: branch.isMain,
      });
      setLogoPreview(branch.logo || '');
      setCoverPreview(branch.coverImage || '');
    } else {
      setEditingBranch(null);
      setFormData({ name: '', address: '', phone: '', logo: '', coverImage: '', isMain: false });
      setLogoPreview('');
      setCoverPreview('');
    }
    setFieldErrors({});
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingBranch(null);
    setFieldErrors({});
    setLogoFile(null);
    setLogoPreview('');
    setCoverFile(null);
    setCoverPreview('');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo file size exceeds 5MB limit.');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Banner image file size exceeds 5MB limit.');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      if (editingBranch) {
        await updateBranch({
          branchId: editingBranch.id,
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          isMain: formData.isMain,
          logoFile: logoFile || undefined,
          logoUrl: !logoFile && formData.logo ? formData.logo : undefined,
          coverFile: coverFile || undefined,
          coverUrl: !coverFile && formData.coverImage ? formData.coverImage : undefined,
        });
        toast.success('Branch logo & banner updated!');
      } else {
        await createBranch({
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          isMain: formData.isMain,
          logoFile: logoFile || undefined,
          logoUrl: !logoFile && formData.logo ? formData.logo : undefined,
          coverFile: coverFile || undefined,
          coverUrl: !coverFile && formData.coverImage ? formData.coverImage : undefined,
        });
        toast.success('Branch created successfully!');
      }
      handleClose();
    } catch (err: any) {
      const valErrors = extractValidationErrors(err);
      if (Object.keys(valErrors).length > 0) {
        setFieldErrors(valErrors);
        toast.error('Please fix the errors shown below.');
      } else {
        toast.error(err?.message || 'Failed to save branch.');
      }
    }
  };

  const handleDelete = async (branch: BranchModel) => {
    if (!window.confirm(`Delete ${branch.name}?`)) return;
    try {
      await deleteBranch({ branchId: branch.id });
      toast.success('Branch deleted successfully.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete branch.');
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await importCatalog(importData);
      const stats = res?.stats;
      toast.success(
        `Catalog imported! (${stats?.categories || 0} categories, ${stats?.products || 0} products, ${stats?.menus || 0} menus copied)`
      );
      setImportModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to import branch catalog.');
    }
  };

  const columns = useMemo(() => {
    return buildBranchColumns({
      onEdit: handleOpen,
      onDelete: handleDelete,
    });
  }, [branches]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Restaurant Branches & Branding
          </h2>
          <p className="text-sm text-slate-500">
            Manage branch details, phone numbers, brand logo, and header banner images for QR menus.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {branches.length >= 2 && (
            <button
              type="button"
              onClick={() => {
                setImportData({
                  sourceBranchId: branches[0]?.id || '',
                  targetBranchId: branches[1]?.id || '',
                  includeCategoriesAndProducts: true,
                  includeMenus: true,
                  includeFeatured: true,
                });
                setImportModalOpen(true);
              }}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition shadow-sm"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Import Catalog</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleOpen()}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create Branch</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={branches}
        keyExtractor={(item) => String(item.id)}
        isLoading={isLoading}
        emptyMessage="No restaurant branches found."
      />

      <BranchFormModal
        isOpen={modalOpen}
        onClose={handleClose}
        editingBranch={editingBranch}
        formData={formData}
        setFormData={setFormData}
        logoFile={logoFile}
        setLogoFile={setLogoFile}
        logoPreview={logoPreview}
        setLogoPreview={setLogoPreview}
        coverFile={coverFile}
        setCoverFile={setCoverFile}
        coverPreview={coverPreview}
        setCoverPreview={setCoverPreview}
        handleLogoChange={handleLogoChange}
        handleCoverChange={handleCoverChange}
        errors={fieldErrors}
        setErrors={setFieldErrors}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <BranchImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        branches={branches}
        importData={importData}
        setImportData={setImportData}
        onSubmit={handleImportSubmit}
        isSubmitting={isImporting}
      />
    </div>
  );
};

export default BranchesPage;
