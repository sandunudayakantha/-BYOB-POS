import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBranch } from '@/contexts/BranchContext';
import { useInventoryItemsUseCase } from '@/app/domain/inventory/use-inventory-items.use-case';
import { usePrepDefinitionsUseCase } from '@/app/domain/inventory/use-prep-definitions.use-case';
import { usePrepBatchesUseCase } from '@/app/domain/inventory/use-prep-batches.use-case';
import { useItemBatchesUseCase } from '@/app/domain/inventory/use-item-batches.use-case';
import { useUomsUseCase } from '@/app/domain/inventory/use-uoms.use-case';
import { useSuppliersUseCase } from '@/app/domain/inventory/use-suppliers.use-case';
import { useUpdateRawItemUseCase } from '@/app/domain/inventory/use-update-raw-item.use-case';
import { useLogPrepBatchUseCase } from '@/app/domain/inventory/use-log-prep-batch.use-case';
import { RawMaterialsTab } from '@/app/components/inventory/raw-materials-tab.component';
import { KitchenPrepsTab } from '@/app/components/inventory/kitchen-preps-tab.component';
import { RawItemDetail } from '@/app/components/inventory/raw-item-detail.component';
import { EditRawItemModal } from '@/app/components/inventory/edit-raw-item-modal.component';
import { LogPrepBatchModal } from '@/app/components/inventory/log-prep-batch-modal.component';
import type { KitchenPrepDefinitionModel } from '@/app/models/inventory.model';
import { ArchiveBoxIcon, BeakerIcon, CameraIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const InventoryPage: React.FC = () => {
  const { activeBranch } = useBranch();
  const branchId = Number(activeBranch?._id || activeBranch?.id || 1);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get('tab') || 'items';
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogBatchModalOpen, setIsLogBatchModalOpen] = useState(false);
  const [selectedPrepForBatch, setSelectedPrepForBatch] = useState<KitchenPrepDefinitionModel | null>(null);

  // Domain hooks
  const { items, isLoading: itemsLoading } = useInventoryItemsUseCase({ branchId });
  const { prepDefinitions, isLoading: prepsLoading } = usePrepDefinitionsUseCase({ branchId });
  const { prepBatches } = usePrepBatchesUseCase({ branchId });
  const { batches: rawBatches, isLoading: rawBatchesLoading } = useItemBatchesUseCase({
    itemId: selectedItemId || 0,
  });
  const { uoms } = useUomsUseCase();
  const { suppliers } = useSuppliersUseCase(branchId);
  const updateRawItem = useUpdateRawItemUseCase();
  const logPrepBatch = useLogPrepBatchUseCase();

  const selectedItem = items.find((i) => i.id === selectedItemId);

  const handleTabChange = (tabKey: string) => {
    setSelectedItemId(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tabKey === 'items') next.delete('tab');
      else next.set('tab', tabKey);
      return next;
    });
  };

  const handleUpdateItem = async (data: any) => {
    try {
      await updateRawItem.mutateAsync(data);
      toast.success('Raw inventory item updated!');
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update item');
    }
  };

  const handleLogBatch = async (data: any) => {
    try {
      await logPrepBatch.mutateAsync({ ...data, branchId });
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
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Inventory & Kitchen Governance</span>
            {activeBranch?.name && (
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {activeBranch.name}
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage raw materials, chef prep specifications, batch yields, photo evidence, and suppliers.
          </p>
        </div>

        <div className="flex flex-wrap p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 shadow-inner self-start sm:self-auto gap-1">
          <button
            type="button"
            onClick={() => handleTabChange('items')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'items'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CameraIcon className="w-4 h-4" />
            <span>Batch & Evidence Logs</span>
          </button>
        </div>
      </div>

      {currentTab === 'items' && !selectedItem && (
        <RawMaterialsTab
          items={items}
          isLoading={itemsLoading}
          onSelectItem={(item) => setSelectedItemId(item.id)}
          onOpenAddModal={() => {}}
          onOpenStockModal={() => {}}
        />
      )}

      {currentTab === 'items' && selectedItem && (
        <RawItemDetail
          item={selectedItem}
          preps={prepDefinitions}
          batches={rawBatches}
          prepBatches={prepBatches}
          batchesLoading={rawBatchesLoading}
          onBack={() => setSelectedItemId(null)}
          onEditItem={() => setIsEditModalOpen(true)}
          onInwardStock={() => {}}
          onDefinePrep={() => {}}
          onEditPrep={() => {}}
          onLogPrepBatch={(prep) => {
            setSelectedPrepForBatch(prep);
            setIsLogBatchModalOpen(true);
          }}
        />
      )}

      {currentTab === 'preps' && (
        <KitchenPrepsTab
          prepDefinitions={prepDefinitions}
          isLoading={prepsLoading}
          onEditPrep={() => {}}
          onLogBatch={(prep) => {
            setSelectedPrepForBatch(prep);
            setIsLogBatchModalOpen(true);
          }}
        />
      )}

      <EditRawItemModal
        isOpen={isEditModalOpen}
        item={selectedItem || null}
        uoms={uoms}
        suppliers={suppliers}
        isPending={updateRawItem.isPending}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateItem}
      />

      <LogPrepBatchModal
        isOpen={isLogBatchModalOpen}
        prep={selectedPrepForBatch}
        isPending={logPrepBatch.isPending}
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
