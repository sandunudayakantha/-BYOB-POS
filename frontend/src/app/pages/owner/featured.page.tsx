import React, { useState, useMemo } from 'react';
import { useBranch } from '@/contexts/BranchContext';
import { useFeaturedSectionsUseCase } from '@/app/domain/featured/use-featured-sections.use-case';
import { useCreateFeaturedSectionUseCase } from '@/app/domain/featured/use-create-featured-section.use-case';
import { useUpdateFeaturedSectionUseCase } from '@/app/domain/featured/use-update-featured-section.use-case';
import { useDeleteFeaturedSectionUseCase } from '@/app/domain/featured/use-delete-featured-section.use-case';
import { useProductsUseCase } from '@/app/domain/products/use-products.use-case';
import { buildFeaturedColumns } from '@/app/components/featured/featured-table-columns';
import { FeaturedFormModal } from '@/app/components/featured/featured-form-modal.component';
import { FeaturedProductsManagerModal } from '@/app/components/featured/featured-products-manager-modal.component';
import { DataTable } from '@/atomic/obj.data-table';
import toast from 'react-hot-toast';
import type { FeaturedSectionModel } from '@/app/models/featured.model';
import { PlusIcon } from '@heroicons/react/24/outline';

export const FeaturedPage: React.FC = () => {
  const { activeBranch } = useBranch();
  const branchId = String(activeBranch?._id || activeBranch?.id || '');

  const [modalOpen, setModalOpen] = useState(false);
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<FeaturedSectionModel | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    products: [] as (number | string)[],
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const { sections, isLoading } = useFeaturedSectionsUseCase({ branchId });
  const { products: allProducts } = useProductsUseCase({ branchId, limit: 1000 });

  const { createSection, isSubmitting: isCreating } = useCreateFeaturedSectionUseCase();
  const { updateSection, isSubmitting: isUpdating } = useUpdateFeaturedSectionUseCase();
  const { deleteSection } = useDeleteFeaturedSectionUseCase();

  const handleOpenEdit = (sec: FeaturedSectionModel | null = null) => {
    if (sec) {
      setEditingSection(sec);
      setFormData({
        title: sec.title,
        description: sec.description || '',
        products: sec.products || [],
        startDate: sec.startDate ? sec.startDate.slice(0, 10) : '',
        endDate: sec.endDate ? sec.endDate.slice(0, 10) : '',
        isActive: sec.isActive,
      });
    } else {
      setEditingSection(null);
      setFormData({
        title: "Chef's Recommendation",
        description: 'Special dishes recommended by our head chef.',
        products: [],
        startDate: '',
        endDate: '',
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleOpenProducts = (sec: FeaturedSectionModel) => {
    setEditingSection(sec);
    setFormData({
      title: sec.title,
      description: sec.description || '',
      products: sec.products || [],
      startDate: sec.startDate ? sec.startDate.slice(0, 10) : '',
      endDate: sec.endDate ? sec.endDate.slice(0, 10) : '',
      isActive: sec.isActive,
    });
    setProductsModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setProductsModalOpen(false);
    setEditingSection(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSection) {
        await updateSection({
          sectionId: editingSection.id,
          title: formData.title,
          description: formData.description,
          products: formData.products,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isActive: formData.isActive,
        });
        toast.success('Featured banner updated!');
      } else {
        await createSection({
          branchId,
          title: formData.title,
          description: formData.description,
          products: formData.products,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isActive: formData.isActive,
        });
        toast.success('Featured banner created!');
      }
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save section.');
    }
  };

  const handleDelete = async (sec: FeaturedSectionModel) => {
    if (!window.confirm(`Delete ${sec.title}?`)) return;
    try {
      await deleteSection({ sectionId: sec.id });
      toast.success('Featured banner deleted.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete section.');
    }
  };

  const handleToggleStatus = async (sec: FeaturedSectionModel) => {
    try {
      await updateSection({
        sectionId: sec.id,
        isActive: !sec.isActive,
      });
      toast.success(!sec.isActive ? 'Featured banner activated!' : 'Featured banner deactivated.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle status.');
    }
  };

  const handleToggleProduct = async (pId: number | string, pName: string) => {
    if (!editingSection) return;
    const isSelected = formData.products.map(String).includes(String(pId));
    const confirmMsg = isSelected
      ? `Are you sure you want to remove "${pName}" from "${editingSection.title}"?`
      : `Are you sure you want to add "${pName}" to "${editingSection.title}"?`;

    if (!window.confirm(confirmMsg)) return;

    const nextProducts = isSelected
      ? formData.products.filter((id) => String(id) !== String(pId))
      : [...formData.products, pId];

    setFormData((prev) => ({ ...prev, products: nextProducts }));

    try {
      await updateSection({
        sectionId: editingSection.id,
        products: nextProducts,
      });
      toast.success('Banner products updated!');
    } catch {
      toast.error('Failed to update products.');
    }
  };

  const columns = useMemo(() => {
    return buildFeaturedColumns({
      onOpenProducts: handleOpenProducts,
      onEdit: handleOpenEdit,
      onDelete: handleDelete,
      onToggleStatus: handleToggleStatus,
    });
  }, [sections]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Promotional & Featured Banners
          </h2>
          <p className="text-sm text-slate-500">
            Create promotional banners highlighted at the top of customer QR digital menus.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenEdit(null)}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create Banner</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={sections}
        keyExtractor={(item) => String(item.id)}
        isLoading={isLoading}
        emptyMessage="No promotional banners created yet."
      />

      <FeaturedFormModal
        isOpen={modalOpen}
        onClose={handleClose}
        editingSection={editingSection}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <FeaturedProductsManagerModal
        isOpen={productsModalOpen}
        onClose={handleClose}
        section={editingSection}
        allProducts={allProducts}
        onToggleProduct={handleToggleProduct}
        selectedProductIds={formData.products}
      />
    </div>
  );
};

export default FeaturedPage;
