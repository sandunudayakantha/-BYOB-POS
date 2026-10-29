import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBranch } from '@/contexts/BranchContext';
import { useInventoryItemsUseCase } from '@/app/domain/inventory/use-inventory-items.use-case';
import { usePrepDefinitionsUseCase } from '@/app/domain/inventory/use-prep-definitions.use-case';
import { usePrepBatchesUseCase } from '@/app/domain/inventory/use-prep-batches.use-case';
import { useItemBatchesUseCase } from '@/app/domain/inventory/use-item-batches.use-case';
import { useUomsUseCase } from '@/app/domain/inventory/use-uoms.use-case';
import { useSuppliersUseCase } from '@/app/domain/inventory/use-suppliers.use-case';
import { useCreateRawItemUseCase } from '@/app/domain/inventory/use-create-raw-item.use-case';
import { useUpdateRawItemUseCase } from '@/app/domain/inventory/use-update-raw-item.use-case';
import { useDeleteRawItemUseCase } from '@/app/domain/inventory/use-delete-raw-item.use-case';
import { useInwardStockBatchUseCase } from '@/app/domain/inventory/use-inward-stock-batch.use-case';
import { useCreatePrepDefinitionUseCase } from '@/app/domain/inventory/use-create-prep-definition.use-case';
import { useUpdatePrepDefinitionUseCase } from '@/app/domain/inventory/use-update-prep-definition.use-case';
import { useLogPrepBatchUseCase } from '@/app/domain/inventory/use-log-prep-batch.use-case';
import { RawMaterialsTab } from '@/app/components/inventory/raw-materials-tab.component';
import { KitchenPrepsTab } from '@/app/components/inventory/kitchen-preps-tab.component';
import { BatchEvidenceTab } from '@/app/components/inventory/batch-evidence-tab.component';
import { RawItemDetail } from '@/app/components/inventory/raw-item-detail.component';
import { CreateRawItemModal } from '@/app/components/inventory/create-raw-item-modal.component';
import { EditRawItemModal } from '@/app/components/inventory/edit-raw-item-modal.component';
import { InwardStockModal } from '@/app/components/inventory/inward-stock-modal.component';
import { PrepDefinitionModal } from '@/app/components/inventory/prep-definition-modal.component';
import { LogPrepBatchModal } from '@/app/components/inventory/log-prep-batch-modal.component';
import type { InventoryItemModel, KitchenPrepDefinitionModel } from '@/app/models/inventory.model';
import { ArchiveBoxIcon, BeakerIcon, CameraIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const InventoryPage: React.FC = () => {
  const { activeBranch } = useBranch();
  const branchId = Number(activeBranch?._id || activeBranch?.id || 0);
  const isBranchLoading = !activeBranch || !branchId;
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get('tab') || 'items';
  const rawItemIdParam = searchParams.get('itemId');
  const selectedItemId = rawItemIdParam ? Number(rawItemIdParam) : null;

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [stockModalItem, setStockModalItem] = useState<InventoryItemModel | null>(null);
  const [isLogBatchModalOpen, setIsLogBatchModalOpen] = useState(false);
  const [selectedPrepForBatch, setSelectedPrepForBatch] = useState<KitchenPrepDefinitionModel | null>(null);
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [editingPrep, setEditingPrep] = useState<KitchenPrepDefinitionModel | null>(null);
  const [prepBaseItem, setPrepBaseItem] = useState<InventoryItemModel | null>(null);

  // Domain hooks
  const { items, isLoading: itemsLoading } = useInventoryItemsUseCase({ branchId });
  const { prepDefinitions, isLoading: prepsLoading } = usePrepDefinitionsUseCase({ branchId });
  const { prepBatches } = usePrepBatchesUseCase({ branchId });
  const { batches: rawBatches, isLoading: rawBatchesLoading } = useItemBatchesUseCase({
    itemId: selectedItemId || 0,
  });
  const { uoms } = useUomsUseCase();
  const { suppliers } = useSuppliersUseCase(branchId);
  const { createRawItem, isSubmitting: isCreatingItem } = useCreateRawItemUseCase();
  const { deleteRawItem } = useDeleteRawItemUseCase({ branchId });
  const { inwardStockBatch, isSubmitting: isInwardingStock } = useInwardStockBatchUseCase();
  const { createPrepDefinition, isSubmitting: isCreatingPrep } = useCreatePrepDefinitionUseCase();
  const { updatePrepDefinition, isSubmitting: isUpdatingPrep } = useUpdatePrepDefinitionUseCase(branchId);
  const { updateRawItem, isSubmitting: isUpdatingItem } = useUpdateRawItemUseCase(branchId);
  const { logPrepBatch, isSubmitting: isLoggingBatch } = useLogPrepBatchUseCase();

  const selectedItem = items.find((i) => i.id === selectedItemId);

  const handleSelectItem = (item: InventoryItemModel) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('itemId', String(item.id));
      return next;
    });
  };

  const handleBackFromDetail = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('itemId');
      return next;
    });
  };

  const handleTabChange = (tabKey: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('itemId');
      if (tabKey === 'items') next.delete('tab');
      else next.set('tab', tabKey);
      return next;
    });
  };

  const handleCreateRawItem = async (data: any) => {
    if (!branchId) {
      toast.error('Please select an active branch first.');
      return;
    }
    try {
      await createRawItem({
        ...data,
        branchId,
      });
      toast.success('Raw material added successfully!');
      setIsCreateModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add raw material');
    }
  };

  const handleDeleteRawItem = async (item: InventoryItemModel) => {
    const confirmed = window.confirm(
      `Delete "${item.name}"? Historical batches and audit logs will be preserved, but it will be removed from active inventory and preps.`
    );
    if (!confirmed) return;

    try {
      await deleteRawItem({ itemId: item.id });
      toast.success(`"${item.name}" has been deleted.`);
      if (selectedItemId === item.id) {
        handleBackFromDetail();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete raw material');
    }
  };

  const handleInwardStock = async (data: any) => {
    if (!branchId) {
      toast.error('Please select an active branch first.');
      return;
    }
    try {
      await inwardStockBatch({
        ...data,
        branchId,
      });
      toast.success('Stock inward recorded successfully!');
      setStockModalItem(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to record inward stock');
    }
  };

  const handleOpenDefinePrep = (base?: InventoryItemModel) => {
    setEditingPrep(null);
    setPrepBaseItem(base || selectedItem || null);
    setIsPrepModalOpen(true);
  };

  const handleOpenEditPrep = (prep: KitchenPrepDefinitionModel) => {
    setEditingPrep(prep);
    const base = items.find((i) => i.id === prep.baseRawItemId) || selectedItem || null;
    setPrepBaseItem(base);
    setIsPrepModalOpen(true);
  };

  const handleSubmitPrep = async (data: any) => {
    if (!branchId) {
      toast.error('Please select an active branch first.');
      return;
    }
    try {
      if (data.prepId) {
        await updatePrepDefinition({ ...data, prepId: data.prepId });
        toast.success('Kitchen prep specification updated!');
      } else {
        await createPrepDefinition({ ...data, branchId });
        toast.success('Kitchen prep specification created!');
      }
      setIsPrepModalOpen(false);
      setEditingPrep(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save prep specification');
    }
  };

  const handleUpdateItem = async (data: any) => {
    try {
      await updateRawItem(data);
      toast.success('Raw inventory item updated!');
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update item');
    }
  };

  const handleLogBatch = async (data: any) => {
    try {
      await logPrepBatch({ ...data, branchId });
      toast.success('Prep batch logged and stock adjusted!');
      setIsLogBatchModalOpen(false);
      setSelectedPrepForBatch(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to log batch');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
            <span>Inventory & Kitchen Governance</span>
            {activeBranch?.name && (
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {activeBranch.name}
              </span>
            )}
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Manage raw materials, chef prep specifications, batch yields, photo evidence, and suppliers.
          </p>
        </div>

        <div className="flex flex-wrap p-1 bg-stone-200/70 dark:bg-stone-900/80 rounded-2xl border border-stone-300/50 dark:border-stone-800/60 shadow-inner self-start sm:self-auto gap-1">
          <button
            type="button"
            onClick={() => handleTabChange('items')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'items'
                ? 'bg-white dark:bg-stone-950 text-amber-600 dark:text-amber-400 shadow-sm border border-stone-200/60 dark:border-stone-800'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <ArchiveBoxIcon className="w-4 h-4" />
            <span>Raw Materials ({items.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('preps')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'preps'
                ? 'bg-white dark:bg-stone-950 text-amber-600 dark:text-amber-400 shadow-sm border border-stone-200/60 dark:border-stone-800'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <BeakerIcon className="w-4 h-4" />
            <span>All Kitchen Preps ({prepDefinitions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('batches')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'batches'
                ? 'bg-white dark:bg-stone-950 text-amber-600 dark:text-amber-400 shadow-sm border border-stone-200/60 dark:border-stone-800'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <CameraIcon className="w-4 h-4" />
            <span>Batch & Evidence Logs</span>
          </button>
        </div>
      </div>

      {currentTab === 'items' && !selectedItemId && (
        <RawMaterialsTab
          items={items}
          isLoading={itemsLoading || isBranchLoading}
          onSelectItem={handleSelectItem}
          onOpenAddModal={() => setIsCreateModalOpen(true)}
          onOpenStockModal={(item) => setStockModalItem(item)}
          onDeleteItem={handleDeleteRawItem}
        />
      )}

      {currentTab === 'items' && selectedItemId && (
        itemsLoading || isBranchLoading ? (
          <div className="p-12 text-center text-xs text-stone-400">Loading raw material details...</div>
        ) : selectedItem ? (
          <RawItemDetail
            branchId={branchId}
            item={selectedItem}
            preps={prepDefinitions}
            batches={rawBatches}
            prepBatches={prepBatches}
            batchesLoading={rawBatchesLoading}
            onBack={handleBackFromDetail}
            onEditItem={() => setIsEditModalOpen(true)}
            onInwardStock={() => setStockModalItem(selectedItem)}
            onDefinePrep={() => handleOpenDefinePrep(selectedItem)}
            onEditPrep={(prep) => handleOpenEditPrep(prep)}
            onLogPrepBatch={(prep) => {
              setSelectedPrepForBatch(prep);
              setIsLogBatchModalOpen(true);
            }}
            onDeleteItem={handleDeleteRawItem}
          />
        ) : (
          <div className="p-8 text-center bg-stone-900 border border-stone-800 rounded-2xl text-stone-400 text-xs space-y-3">
            <p>Raw inventory item not found or may have been deleted.</p>
            <button
              type="button"
              onClick={handleBackFromDetail}
              className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition"
            >
              Return to Raw Materials
            </button>
          </div>
        )
      )}

      {currentTab === 'preps' && (
        <KitchenPrepsTab
          prepDefinitions={prepDefinitions}
          isLoading={prepsLoading || isBranchLoading}
          onOpenAddPrep={() => handleOpenDefinePrep()}
          onEditPrep={(prep) => handleOpenEditPrep(prep)}
          onLogBatch={(prep) => {
            setSelectedPrepForBatch(prep);
            setIsLogBatchModalOpen(true);
          }}
        />
      )}

      {currentTab === 'batches' && (
        <BatchEvidenceTab
          branchId={branchId}
          rawItems={items}
          preps={prepDefinitions}
        />
      )}

      <CreateRawItemModal
        isOpen={isCreateModalOpen}
        uoms={uoms}
        suppliers={suppliers}
        isPending={isCreatingItem}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRawItem}
      />

      <InwardStockModal
        isOpen={Boolean(stockModalItem)}
        item={stockModalItem}
        suppliers={suppliers}
        isPending={isInwardingStock}
        onClose={() => setStockModalItem(null)}
        onSubmit={handleInwardStock}
      />

      <EditRawItemModal
        isOpen={isEditModalOpen}
        item={selectedItem || null}
        uoms={uoms}
        suppliers={suppliers}
        isPending={isUpdatingItem}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateItem}
      />

      <PrepDefinitionModal
        isOpen={isPrepModalOpen}
        baseItem={prepBaseItem}
        rawItems={items}
        editingPrep={editingPrep}
        uoms={uoms}
        isPending={isCreatingPrep || isUpdatingPrep}
        onClose={() => {
          setIsPrepModalOpen(false);
          setEditingPrep(null);
        }}
        onSubmit={handleSubmitPrep}
      />

      <LogPrepBatchModal
        isOpen={isLogBatchModalOpen}
        prep={selectedPrepForBatch}
        isPending={isLoggingBatch}
        onClose={() => {
          setIsLogBatchModalOpen(false);
          setSelectedPrepForBatch(null);
        }}
        onSubmit={handleLogBatch}
      />
    </div>
  );
};

export default InventoryPage;
