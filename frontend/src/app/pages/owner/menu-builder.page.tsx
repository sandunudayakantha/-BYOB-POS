import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBranch } from '@/contexts/BranchContext';
import { useMenusUseCase } from '@/app/domain/menus/use-menus.use-case';
import { useMenuItemsUseCase } from '@/app/domain/menus/use-menu-items.use-case';
import { useAddMenuItemUseCase } from '@/app/domain/menus/use-add-menu-item.use-case';
import { useUpdateMenuItemUseCase } from '@/app/domain/menus/use-update-menu-item.use-case';
import { useReorderMenuItemsUseCase } from '@/app/domain/menus/use-reorder-menu-items.use-case';
import { useRemoveMenuItemUseCase } from '@/app/domain/menus/use-remove-menu-item.use-case';
import { useProductsUseCase } from '@/app/domain/products/use-products.use-case';
import { AddMenuItemModal } from '@/app/components/menus/add-menu-item-modal.component';
import { EditMenuItemModal } from '@/app/components/menus/edit-menu-item-modal.component';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import type { MenuItemModel } from '@/app/models/menu.model';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  Bars3Icon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export const MenuBuilderPage: React.FC = () => {
  const { menuId = '' } = useParams<{ menuId: string }>();
  const navigate = useNavigate();
  const { activeBranch } = useBranch();
  const branchId = String(activeBranch?._id || activeBranch?.id || '');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItemModel | null>(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const { menus } = useMenusUseCase({ branchId });
  const menu = menus.find((m) => String(m.id) === String(menuId));

  const { items: menuItems, isLoading } = useMenuItemsUseCase({ menuId });
  const { products: allProducts } = useProductsUseCase({ branchId, limit: 200 });

  const { addMenuItem, isSubmitting: isAdding } = useAddMenuItemUseCase();
  const { updateMenuItem, isSubmitting: isUpdating } = useUpdateMenuItemUseCase();
  const { reorderMenuItems } = useReorderMenuItemsUseCase();
  const { removeMenuItem } = useRemoveMenuItemUseCase();

  const availableProducts = allProducts.filter(
    (p) => !menuItems.some((item) => String(item.productId) === String(p.id))
  );

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(menuItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedPayload = items.map((item, idx) => ({
      id: item.id,
      displayOrder: idx + 1,
    }));

    try {
      await reorderMenuItems({ items: reorderedPayload });
      toast.success('Sort order updated!');
    } catch {
      toast.error('Failed to update sort order.');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !customPrice) return;
    try {
      await addMenuItem({
        menuId,
        productId: selectedProductId,
        price: Number(customPrice),
      });
      toast.success('Product added to menu!');
      setAddModalOpen(false);
      setSelectedProductId('');
      setCustomPrice('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add product to menu.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      await updateMenuItem({
        itemId: editItem.id,
        price: Number(editPrice),
      });
      toast.success('Menu item updated!');
      setEditItem(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update item.');
    }
  };

  const handleToggleAvailability = async (item: MenuItemModel) => {
    try {
      await updateMenuItem({
        itemId: item.id,
        isAvailable: !item.isAvailable,
      });
      toast.success('Availability updated!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update availability.');
    }
  };

  const handleRemove = async (item: MenuItemModel) => {
    if (!window.confirm(`Remove ${item.productName || 'item'} from this menu?`)) return;
    try {
      await removeMenuItem({ itemId: item.id });
      toast.success('Product removed from menu.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove item.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/menus')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Menu Builder: {menu?.name || 'Loading...'}
            </h2>
            <p className="text-sm text-slate-500">
              Drag and drop items to reorder, set custom menu prices, and toggle availability.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (availableProducts.length > 0) {
              setSelectedProductId(availableProducts[0].id);
            }
            setAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Product to Menu</span>
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="menuItems">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400">Loading menu layout...</div>
              ) : menuItems.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500">
                  No products in this menu yet. Click "Add Product to Menu" above to begin.
                </div>
              ) : (
                menuItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className={`p-4 bg-white dark:bg-slate-900 rounded-2xl border ${
                          snapshot.isDragging
                            ? 'border-emerald-500 shadow-2xl bg-emerald-50/20'
                            : 'border-slate-200 dark:border-slate-800 shadow-sm'
                        } flex items-center justify-between gap-4 transition`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            {...dragProvided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Drag to reorder"
                          >
                            <Bars3Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-base">
                              {item.productName || 'Product Item'}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                              <span>Category: {item.categoryName || 'General'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                              Menu Price
                            </span>
                            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                              LKR {Number(item.price).toFixed(2)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                              item.isAvailable
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {item.isAvailable ? <CheckIcon className="w-3.5 h-3.5" /> : <XMarkIcon className="w-3.5 h-3.5" />}
                            <span>{item.isAvailable ? 'Available' : 'Hidden'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditItem(item);
                              setEditPrice(String(item.price));
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <AddMenuItemModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        availableProducts={availableProducts}
        selectedProductId={selectedProductId}
        setSelectedProductId={setSelectedProductId}
        customPrice={customPrice}
        setCustomPrice={setCustomPrice}
        onSubmit={handleAddSubmit}
        isSubmitting={isAdding}
      />

      <EditMenuItemModal
        isOpen={Boolean(editItem)}
        onClose={() => setEditItem(null)}
        editItem={editItem}
        editPrice={editPrice}
        setEditPrice={setEditPrice}
        onSubmit={handleEditSubmit}
        isSubmitting={isUpdating}
      />
    </div>
  );
};

export default MenuBuilderPage;
