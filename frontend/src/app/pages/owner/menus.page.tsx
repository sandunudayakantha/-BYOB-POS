import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBranch } from '@/contexts/BranchContext';
import { useMenusUseCase } from '@/app/domain/menus/use-menus.use-case';
import { useCreateMenuUseCase } from '@/app/domain/menus/use-create-menu.use-case';
import { useUpdateMenuUseCase } from '@/app/domain/menus/use-update-menu.use-case';
import { useDeleteMenuUseCase } from '@/app/domain/menus/use-delete-menu.use-case';
import { useSetBaseMenuUseCase } from '@/app/domain/menus/use-set-base-menu.use-case';
import { useAdjustPricesUseCase } from '@/app/domain/menus/use-adjust-prices.use-case';
import { useFillMissingItemsUseCase } from '@/app/domain/menus/use-fill-missing-items.use-case';
import { buildMenuColumns } from '@/app/components/menus/menu-table-columns';
import { MenuFormModal } from '@/app/components/menus/menu-form-modal.component';
import { PriceAdjustModal } from '@/app/components/price-matrix/price-adjust-modal.component';
import { PriceFillModal } from '@/app/components/price-matrix/price-fill-modal.component';
import PriceMatrixView from '@/components/PriceMatrixView';
import { DataTable } from '@/atomic/obj.data-table';
import { Button } from '@/atomic/atm.button';
import toast from 'react-hot-toast';
import type { MenuModel } from '@/app/models/menu.model';
import { PlusIcon, TableCellsIcon, QueueListIcon } from '@heroicons/react/24/outline';

export const MenusPage: React.FC = () => {
  const { activeBranch } = useBranch();
  const branchId = String(activeBranch?._id || activeBranch?.id || '');

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'MATRIX' | 'LIST'>('MATRIX');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuModel | null>(null);

  const [adjustModalMenu, setAdjustModalMenu] = useState<MenuModel | null>(null);
  const [adjustPercentage, setAdjustPercentage] = useState('15');
  const [adjustSourceMode, setAdjustSourceMode] = useState('BASE_MENU');

  const [fillModalMenu, setFillModalMenu] = useState<MenuModel | null>(null);
  const [fillPercentage, setFillPercentage] = useState('15');
  const [fillOverwrite, setFillOverwrite] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    isBaseMenu: false,
  });

  const { menus, isLoading } = useMenusUseCase({ branchId });
  const { createMenu, isSubmitting: isCreating } = useCreateMenuUseCase();
  const { updateMenu, isSubmitting: isUpdating } = useUpdateMenuUseCase();
  const { deleteMenu } = useDeleteMenuUseCase();
  const { setBaseMenu, isSubmitting: isSettingBase } = useSetBaseMenuUseCase();
  const { adjustPrices, isSubmitting: isAdjusting } = useAdjustPricesUseCase();
  const { fillMissingItems, isSubmitting: isFilling } = useFillMissingItemsUseCase();

  const handleOpen = (m: MenuModel | null = null) => {
    if (m) {
      setEditingMenu(m);
      setFormData({
        name: m.name,
        description: m.description || '',
        status: m.status,
        isBaseMenu: m.isBaseMenu || false,
      });
    } else {
      setEditingMenu(null);
      setFormData({
        name: '',
        description: '',
        status: 'ACTIVE',
        isBaseMenu: menus.length === 0,
      });
    }
    setModalOpen(true);
  };

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      handleOpen(null);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('create');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams]);

  const handleClose = () => {
    setModalOpen(false);
    setEditingMenu(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMenu) {
        await updateMenu({
          menuId: editingMenu.id,
          name: formData.name,
          description: formData.description,
          status: formData.status,
          isBaseMenu: formData.isBaseMenu,
        });
        toast.success('Menu updated!');
      } else {
        await createMenu({
          branchId,
          name: formData.name,
          description: formData.description,
          status: formData.status,
          isBaseMenu: formData.isBaseMenu,
        });
        toast.success('Menu created!');
      }
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save menu.');
    }
  };

  const handleDelete = async (m: MenuModel) => {
    if (!window.confirm(`Delete ${m.name}?`)) return;
    try {
      await deleteMenu({ menuId: m.id });
      toast.success('Menu deleted.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete menu.');
    }
  };

  const handleToggleBase = async (m: MenuModel) => {
    try {
      await setBaseMenu({ menuId: m.id });
      toast.success('Set as Base Menu for this branch!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to set as base menu.');
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalMenu) return;
    try {
      await adjustPrices({
        menuId: adjustModalMenu.id,
        percentage: Number(adjustPercentage),
        sourceMode: adjustSourceMode,
      });
      toast.success('Menu prices adjusted!');
      setAdjustModalMenu(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to adjust menu prices.');
    }
  };

  const handleFillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fillModalMenu) return;
    try {
      await fillMissingItems({
        menuId: fillModalMenu.id,
        percentage: Number(fillPercentage),
        overwriteExisting: fillOverwrite,
      });
      toast.success('Populated menu items successfully!');
      setFillModalMenu(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to populate menu items.');
    }
  };

  const columns = useMemo(() => {
    return buildMenuColumns({
      onToggleBase: handleToggleBase,
      onOpenFill: (m) => {
        setFillModalMenu(m);
        setFillPercentage('15');
        setFillOverwrite(false);
      },
      onOpenAdjust: (m) => {
        setAdjustModalMenu(m);
        setAdjustPercentage('15');
        setAdjustSourceMode('BASE_MENU');
      },
      onEdit: handleOpen,
      onDelete: handleDelete,
      isSettingBase,
    });
  }, [menus, isSettingBase]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
            <span>Branch Menus & Price Matrix</span>
            {activeBranch?.name && (
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {activeBranch.name}
              </span>
            )}
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Compare prices across channels, adjust percentage markups, and configure catalog items.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex p-1 bg-stone-200/70 dark:bg-stone-900/80 rounded-2xl border border-stone-300/50 dark:border-stone-800/60 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('MATRIX')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'MATRIX'
                  ? 'bg-white dark:bg-stone-950 text-amber-600 dark:text-amber-400 shadow-sm border border-stone-200/60 dark:border-stone-800'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <TableCellsIcon className="w-4 h-4" />
              <span>Price Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('LIST')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'LIST'
                  ? 'bg-white dark:bg-stone-950 text-amber-600 dark:text-amber-400 shadow-sm border border-stone-200/60 dark:border-stone-800'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <QueueListIcon className="w-4 h-4" />
              <span>Menu List</span>
            </button>
          </div>

          <Button
            type="button"
            variant="primary"
            rounded="full"
            onClick={() => handleOpen()}
            className="flex items-center justify-center gap-2 py-2.5 px-5 font-bold text-sm shadow-none transition active:scale-95"
          >
            <PlusIcon className="w-5 h-5 stroke-[2.5]" />
            <span>Create Menu</span>
          </Button>
        </div>
      </div>

      {activeTab === 'MATRIX' && <PriceMatrixView branchId={branchId} />}

      {activeTab === 'LIST' && (
        <DataTable
          columns={columns}
          data={menus}
          keyExtractor={(item) => String(item.id)}
          isLoading={isLoading}
          emptyMessage="No menus created yet for this branch."
        />
      )}

      <MenuFormModal
        isOpen={modalOpen}
        onClose={handleClose}
        editingMenu={editingMenu}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <PriceAdjustModal
        isOpen={Boolean(adjustModalMenu)}
        onClose={() => setAdjustModalMenu(null)}
        menu={adjustModalMenu}
        adjustPercentage={adjustPercentage}
        setAdjustPercentage={setAdjustPercentage}
        adjustSourceMode={adjustSourceMode}
        setAdjustSourceMode={setAdjustSourceMode}
        onSubmit={handleAdjustSubmit}
        isSubmitting={isAdjusting}
      />

      <PriceFillModal
        isOpen={Boolean(fillModalMenu)}
        onClose={() => setFillModalMenu(null)}
        menu={fillModalMenu}
        fillPercentage={fillPercentage}
        setFillPercentage={setFillPercentage}
        fillOverwrite={fillOverwrite}
        setFillOverwrite={setFillOverwrite}
        onSubmit={handleFillSubmit}
        isSubmitting={isFilling}
      />
    </div>
  );
};

export default MenusPage;
