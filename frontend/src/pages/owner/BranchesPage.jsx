import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useBranch } from '../../contexts/BranchContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import { FormInput, FormSelect } from '../../components/FormFields';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon, PencilIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const BranchesPage = () => {
  const queryClient = useQueryClient();
  const { fetchBranches } = useBranch();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importData, setImportData] = useState({
    sourceBranchId: '',
    targetBranchId: '',
    includeCategoriesAndProducts: true,
    includeMenus: true,
    includeFeatured: true
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    logo: '',
    coverImage: '',
    isMain: false
  });

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['ownerBranches'],
    queryFn: async () => {
      const res = await api.get('/branches');
      return res.data;
    }
  });

  const importMutation = useMutation({
    mutationFn: (data) => api.post('/branches/import', data),
    onSuccess: (res) => {
      const stats = res.data?.stats;
      toast.success(
        `Catalog imported! (${stats?.categories || 0} categories, ${stats?.products || 0} products, ${stats?.menus || 0} menus copied)`
      );
      queryClient.invalidateQueries(['ownerBranches']);
      queryClient.invalidateQueries(['ownerCategories']);
      queryClient.invalidateQueries(['ownerProducts']);
      queryClient.invalidateQueries(['ownerMenus']);
      queryClient.invalidateQueries(['featuredSections']);
      setImportModalOpen(false);
    },
    onError: (err) => toast.error(err.message || 'Failed to import branch catalog.')
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = new FormData();
      payload.append('name', data.name);
      payload.append('address', data.address);
      payload.append('phone', data.phone);
      payload.append('isMain', data.isMain);

      if (logoFile) {
        payload.append('logo', logoFile);
      } else if (data.logo) {
        payload.append('logo', data.logo);
      }

      if (coverFile) {
        payload.append('coverImage', coverFile);
      } else if (data.coverImage) {
        payload.append('coverImage', data.coverImage);
      }

      if (editingBranch) {
        return api.put(`/branches/${editingBranch._id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      return api.post('/branches', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      toast.success(editingBranch ? 'Branch logo & banner updated!' : 'Branch created successfully!');
      queryClient.invalidateQueries(['ownerBranches']);
      fetchBranches();
      handleClose();
    },
    onError: (err) => toast.error(err.message || 'Failed to save branch.')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/branches/${id}`),
    onSuccess: () => {
      toast.success('Branch deleted successfully.');
      queryClient.invalidateQueries(['ownerBranches']);
      fetchBranches();
    },
    onError: (err) => toast.error(err.message || 'Failed to delete branch.')
  });

  const handleOpen = (branch = null) => {
    setLogoFile(null);
    setCoverFile(null);
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        logo: branch.logo || '',
        coverImage: branch.coverImage || '',
        isMain: branch.isMain
      });
      setLogoPreview(branch.logo || '');
      setCoverPreview(branch.coverImage || '');
    } else {
      setEditingBranch(null);
      setFormData({ name: '', address: '', phone: '', logo: '', coverImage: '', isMain: false });
      setLogoPreview('');
      setCoverPreview('');
    }
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingBranch(null);
    setLogoFile(null);
    setLogoPreview('');
    setCoverFile(null);
    setCoverPreview('');
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo file size exceeds 5MB limit.');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Banner image file size exceeds 5MB limit.');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const columns = [
    {
      header: 'Branch & Branding',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.logo ? (
            <img src={row.logo} alt={row.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30 flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center flex-shrink-0">
              {row.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {row.name}
              {row.isMain && <span className="px-2 py-0.5 text-[10px] rounded-md bg-emerald-600 text-white font-bold">Main</span>}
            </div>
            <div className="text-xs text-slate-400">{row.phone}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Cover Banner',
      accessor: 'coverImage',
      render: (row) => (
        row.coverImage ? (
          <img src={row.coverImage} alt="Banner" className="w-24 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm" />
        ) : (
          <span className="text-xs text-slate-400 italic">No Banner</span>
        )
      )
    },
    { header: 'Address', accessor: 'address' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpen(row)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Edit Branch & Branding"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          {!row.isMain && (
            <button
              onClick={() => {
                if (window.confirm(`Delete ${row.name}?`)) deleteMutation.mutate(row._id);
              }}
              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Delete Branch"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

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
              onClick={() => {
                setImportData({
                  sourceBranchId: branches[0]?._id || '',
                  targetBranchId: branches[1]?._id || branches[0]?._id || '',
                  includeCategoriesAndProducts: true,
                  includeMenus: true,
                  includeFeatured: true
                });
                setImportModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700 font-bold text-sm shadow-sm transition active:scale-95"
            >
              <ArrowPathIcon className="w-5 h-5 text-amber-500" />
              Import Catalog
            </button>
          )}
          <button
            onClick={() => handleOpen()}
            className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-none transition active:scale-95"
          >
            <PlusIcon className="w-5 h-5 stroke-[2.5]" />
            Create Branch
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={branches} loading={isLoading} searchPlaceholder="Search branches..." />

      {/* Edit / Create Branch Modal */}
      <Modal isOpen={modalOpen} onClose={handleClose} title={editingBranch ? 'Edit Branch Branding' : 'Add New Branch'}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(formData);
          }}
          className="space-y-4 max-h-[78vh] overflow-y-auto pr-1"
        >
          <FormInput
            label="Branch Name"
            placeholder="e.g. Colombo Branch"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <FormInput
            label="Address"
            placeholder="e.g. 77 Galle Road, Colombo 03"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          <FormInput
            label="Phone Number"
            placeholder="e.g. +94 11 234 5678"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          {/* 1. Branch Logo Upload (Cloudinary) */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Branch Logo (Cloudinary)
            </label>

            <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-4">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500/50 shadow-md flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center font-bold flex-shrink-0">
                  <PhotoIcon className="w-7 h-7" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {logoFile ? logoFile.name : logoPreview ? 'Current Logo' : 'No Logo Uploaded'}
                </p>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer transition shadow-sm">
                  <PhotoIcon className="w-3.5 h-3.5" /> Upload Logo
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* 2. Branch Cover Banner Upload (Cloudinary) */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Header Banner / Cover Image (Cloudinary)
            </label>

            <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              {coverPreview ? (
                <div className="relative w-full h-24 rounded-xl overflow-hidden ring-1 ring-slate-300 dark:ring-slate-700 shadow-md">
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <label className="px-3 py-1.5 rounded-xl bg-white/90 text-slate-900 text-xs font-bold hover:bg-white cursor-pointer transition shadow-lg">
                      Change Banner
                      <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Upload header cover banner</p>
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer transition shadow-sm">
                    <PhotoIcon className="w-4 h-4" /> Upload Banner Image
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition"
          >
            {saveMutation.isPending ? 'Saving...' : editingBranch ? 'Update Branch & Branding' : 'Create Branch'}
          </button>
        </form>
      </Modal>

      {/* Import Catalog Across Branches Modal */}
      <Modal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} title="Import Catalog Across Branches">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (importData.sourceBranchId === importData.targetBranchId) {
              toast.error('Source and target branch must be different!');
              return;
            }
            importMutation.mutate(importData);
          }}
          className="space-y-4"
        >
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Copy categories, products, digital menus, and promotional banners from one branch into another in one click.
          </p>

          <FormSelect
            label="Source Branch (Copy FROM)"
            value={importData.sourceBranchId}
            onChange={(e) => setImportData({ ...importData, sourceBranchId: e.target.value })}
            options={branches.map((b) => ({ value: b._id, label: `${b.name} ${b.isMain ? '(Main)' : ''}` }))}
            required
          />

          <FormSelect
            label="Target Branch (Copy TO)"
            value={importData.targetBranchId}
            onChange={(e) => setImportData({ ...importData, targetBranchId: e.target.value })}
            options={branches.map((b) => ({ value: b._id, label: `${b.name} ${b.isMain ? '(Main)' : ''}` }))}
            required
          />

          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Items to Import
            </label>

            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={importData.includeCategoriesAndProducts}
                  onChange={(e) => setImportData({ ...importData, includeCategoriesAndProducts: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
                <span>Categories & Product Items</span>
              </label>

              <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={importData.includeMenus}
                  onChange={(e) => setImportData({ ...importData, includeMenus: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
                <span>Digital Menus & Menu Item Pricing</span>
              </label>

              <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={importData.includeFeatured}
                  onChange={(e) => setImportData({ ...importData, includeFeatured: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
                <span>Featured Promotional Banners</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={importMutation.isPending}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-md"
          >
            <ArrowPathIcon className="w-4 h-4" />
            {importMutation.isPending ? 'Importing & Cloning Catalog...' : 'Start Cross-Branch Import'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default BranchesPage;
