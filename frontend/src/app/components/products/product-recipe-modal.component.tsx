import React, { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { FormInput, FormSelect } from '@/components/FormFields';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { Button } from '@/atomic/atm.button';
import { PlusIcon, TrashIcon, CalculatorIcon, SparklesIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface ProductRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  branchId: number | string;
}

export const ProductRecipeModal: React.FC<ProductRecipeModalProps> = ({
  isOpen,
  onClose,
  product,
  branchId,
}) => {
  const queryClient = useQueryClient();
  const [ingredients, setIngredients] = useState<any[]>([]);

  // Fetch available inventory items (raw materials and prepared items)
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['inventoryItems', branchId],
    queryFn: async () => {
      const res = await api.get('/inventory/items', { params: { branchId } });
      return res.data || [];
    },
    enabled: isOpen && !!branchId
  });

  // Fetch standard units of measure
  const { data: uoms = [] } = useQuery({
    queryKey: ['inventoryUOMs'],
    queryFn: async () => {
      const res = await api.get('/inventory/uoms');
      return res.data || [];
    },
    enabled: isOpen
  });

  // Fetch current product recipe
  const { data: existingRecipe = [], isLoading } = useQuery({
    queryKey: ['productRecipe', product?._id || product?.id],
    queryFn: async () => {
      const pId = product?._id || product?.id;
      const res = await api.get(`/inventory/recipes/products/${pId}`);
      return res.data || [];
    },
    enabled: isOpen && !!product
  });

  useEffect(() => {
    if (existingRecipe.length > 0) {
      setIngredients(
        existingRecipe.map((r: any) => ({
          inventory_item_id: r.inventory_item_id,
          uom_id: r.uom_id,
          quantity: r.quantity,
          wastage_factor_percent: r.wastage_factor_percent || 0,
        }))
      );
    } else {
      setIngredients([]);
    }
  }, [existingRecipe, isOpen]);

  const saveRecipeMutation = useMutation({
    mutationFn: (payload: any) => {
      const pId = product?._id || product?.id;
      return api.post(`/inventory/recipes/products/${pId}`, payload);
    },
    onSuccess: () => {
      toast.success('Dish recipe & costing saved successfully!');
      queryClient.invalidateQueries(['productRecipe', product?._id || product?.id]);
      onClose();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to save recipe')
  });

  const handleAddIngredient = () => {
    if (inventoryItems.length === 0 || uoms.length === 0) {
      toast.error('Please configure inventory items and units first.');
      return;
    }
    setIngredients([
      ...ingredients,
      {
        inventory_item_id: inventoryItems[0].id,
        uom_id: uoms[0].id,
        quantity: 1,
        wastage_factor_percent: 0,
      }
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleUpdateIngredient = (index: number, field: string, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  // Calculate live dynamic food cost
  const totalCost = ingredients.reduce((sum, ing) => {
    const item = inventoryItems.find((i: any) => i.id === Number(ing.inventory_item_id));
    const uom = uoms.find((u: any) => u.id === Number(ing.uom_id));
    if (!item) return sum;

    const baseCost = Number(item.unit_cost || 0);
    const factor = Number(uom?.conversion_factor || 1);
    const wasteFactor = 1 + Number(ing.wastage_factor_percent || 0) / 100;
    const itemCost = Number(ing.quantity || 0) * factor * baseCost * wasteFactor;
    return sum + itemCost;
  }, 0);

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Recipe & Food Costing: ${product.name}`}>
      <div className="space-y-5">
        {/* Cost Summary Banner */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <CalculatorIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Calculated Food Cost (COGS)</span>
              <span className="text-xl font-black text-amber-500">Rs. {totalCost.toFixed(2)}</span>
            </div>
          </div>
          <span className="text-xs text-stone-400 font-semibold">{ingredients.length} Ingredients</span>
        </div>

        {/* Recipe Ingredients List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Ingredients & Prepped Items</span>
            <Button
              type="button"
              variant="primary"
              size="sm"
              rounded="full"
              onClick={handleAddIngredient}
              className="flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs shadow-none"
            >
              <PlusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Ingredient</span>
            </Button>
          </div>

          {ingredients.length === 0 ? (
            <div className="p-8 text-center bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 text-stone-400 text-xs">
              No recipe ingredients defined yet. Click "Add Ingredient" to connect raw stock or kitchen preps (e.g. Diced Chicken, Eggs, Rice).
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {ingredients.map((ing, idx) => {
                const selectedItem = inventoryItems.find((i: any) => i.id === Number(ing.inventory_item_id));
                const selectedUom = uoms.find((u: any) => u.id === Number(ing.uom_id));
                const estimatedCost =
                  Number(ing.quantity || 0) *
                  Number(selectedUom?.conversion_factor || 1) *
                  Number(selectedItem?.unit_cost || 0) *
                  (1 + Number(ing.wastage_factor_percent || 0) / 100);

                return (
                  <div key={idx} className="p-3 bg-stone-50 dark:bg-stone-900/60 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      {/* Item Selector */}
                      <div className="col-span-5 relative">
                        <select
                          value={ing.inventory_item_id}
                          onChange={(e) => handleUpdateIngredient(idx, 'inventory_item_id', Number(e.target.value))}
                          className="w-full appearance-none text-xs font-semibold pl-2.5 pr-7 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          {inventoryItems.map((item: any) => (
                            <option key={item.id} value={item.id} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                              {item.name} ({item.item_type === 'RAW_MATERIAL' ? 'Raw' : 'Prepped'})
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-stone-400">
                          <ChevronDownIcon className="w-3.5 h-3.5 stroke-[2]" />
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Qty"
                          value={ing.quantity}
                          onChange={(e) => handleUpdateIngredient(idx, 'quantity', Number(e.target.value))}
                          className="w-full text-xs font-semibold p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      {/* UOM */}
                      <div className="col-span-3 relative">
                        <select
                          value={ing.uom_id}
                          onChange={(e) => handleUpdateIngredient(idx, 'uom_id', Number(e.target.value))}
                          className="w-full appearance-none text-xs font-semibold pl-2.5 pr-7 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          {uoms.map((u: any) => (
                            <option key={u.id} value={u.id} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                              {u.symbol} ({u.name})
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-stone-400">
                          <ChevronDownIcon className="w-3.5 h-3.5 stroke-[2]" />
                        </div>
                      </div>

                      {/* Delete */}
                      <div className="col-span-2 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                          title="Remove ingredient"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-200/50 dark:border-stone-800/50">
                      <span>Unit Cost: Rs. {Number(selectedItem?.unit_cost || 0).toFixed(2)}</span>
                      <span className="font-bold text-amber-500">Subtotal: Rs. {estimatedCost.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3">
          <Button
            type="button"
            variant="secondary"
            rounded="full"
            onClick={onClose}
            className="flex-1 py-2.5 font-bold text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            rounded="full"
            disabled={saveRecipeMutation.isPending}
            isLoading={saveRecipeMutation.isPending}
            onClick={() => saveRecipeMutation.mutate({ ingredients })}
            className="flex-1 py-2.5 font-bold text-xs shadow-none"
          >
            Save Recipe & Cost
          </Button>
        </div>
      </div>
    </Modal>
  );
};
