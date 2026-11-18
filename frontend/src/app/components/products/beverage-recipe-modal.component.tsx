import React, { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { Button } from '@/atomic/atm.button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
import type { BarDispenseRuleModel } from '@/app/models/bar-rule.model';
import type { InventoryItemModel } from '@/app/models/inventory.model';
import {
  PlusIcon,
  TrashIcon,
  CalculatorIcon,
  SparklesIcon,
  ChevronDownIcon,
  BeakerIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

export interface BeverageRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  branchId: number | string;
  inventoryItems: InventoryItemModel[];
  barRules: BarDispenseRuleModel[];
}

export const BeverageRecipeModal: React.FC<BeverageRecipeModalProps> = ({
  isOpen,
  onClose,
  product,
  branchId,
  inventoryItems,
  barRules,
}) => {
  const queryClient = useQueryClient();
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [glassware, setGlassware] = useState<string>('Highball Glass (350ml)');
  const [iceProfile, setIceProfile] = useState<string>('Cubed Ice (75% Fill)');
  const [garnish, setGarnish] = useState<string>('');

  // Fetch standard units of measure
  const { data: uoms = [] } = useQuery({
    queryKey: ['inventoryUOMs'],
    queryFn: async () => {
      const res = await api.get('/inventory/uoms');
      return res.data || [];
    },
    enabled: isOpen,
  });

  // Fetch current product recipe
  const { data: existingRecipe = [] } = useQuery({
    queryKey: ['productRecipe', product?._id || product?.id],
    queryFn: async () => {
      const pId = product?._id || product?.id;
      const res = await api.get(`/inventory/recipes/products/${pId}`);
      return res.data || [];
    },
    enabled: isOpen && !!product,
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
      toast.success('Beverage recipe & pour costing saved!');
      queryClient.invalidateQueries({ queryKey: ['productRecipe', product?._id || product?.id] });
      onClose();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to save beverage recipe'),
  });

  const mlUom = uoms.find((u: any) => u.symbol.toLowerCase() === 'ml') || uoms[0];

  const handleAddIngredient = () => {
    if (inventoryItems.length === 0 || uoms.length === 0) {
      toast.error('Please configure inventory items first.');
      return;
    }
    setIngredients([
      ...ingredients,
      {
        inventory_item_id: inventoryItems[0].id,
        uom_id: mlUom?.id || uoms[0].id,
        quantity: 100, // 100 ml default for beverage mixes
        wastage_factor_percent: 0,
      },
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

  // Live dynamic pour cost calculation
  const totalCost = ingredients.reduce((sum, ing) => {
    const item = inventoryItems.find((i: any) => i.id === Number(ing.inventory_item_id));
    const uom = uoms.find((u: any) => u.id === Number(ing.uom_id));
    if (!item) return sum;

    let effectiveUnitCost = Number(item.unitCost || item.unit_cost || 0);

    // Check if item has a global bar rule
    const rule = barRules.find(
      (r) =>
        r.primaryInventoryItemId === item.id ||
        r.fallbackInventoryItemId === item.id ||
        r.beverageName.toLowerCase() === item.name.toLowerCase()
    );

    const ruledItem = rule?.primaryInventoryItemId
      ? inventoryItems.find((i) => i.id === rule.primaryInventoryItemId) || item
      : item;

    const packSize = ruledItem.packSize || (ruledItem as any).pack_size;
    if (packSize && Number(packSize) > 0) {
      effectiveUnitCost = Number(ruledItem.unitCost || (ruledItem as any).unit_cost || 0) / Number(packSize);
    }

    const factor = Number(uom?.conversion_factor || 1);
    const wasteFactor = 1 + Number(ing.wastage_factor_percent || 0) / 100;
    const itemCost = Number(ing.quantity || 0) * factor * effectiveUnitCost * wasteFactor;
    return sum + itemCost;
  }, 0);

  const sellingPrice = Number(product?.price || product?.selling_price || 0);
  const pourCostPercent = sellingPrice > 0 ? (totalCost / sellingPrice) * 100 : 0;

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Mixology Recipe & Pour Costing: ${product.name}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        {/* Costing & Pour Metric Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
              <CalculatorIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Pour Cost (COGS)</span>
              <span className="text-lg font-black text-slate-900">Rs. {totalCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
              <BeakerIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Menu Selling Price</span>
              <span className="text-lg font-black text-slate-900">
                Rs. {sellingPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              pourCostPercent > 35
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Pour Cost %</span>
              <span className={`text-lg font-black ${
                pourCostPercent > 35 ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {pourCostPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Bar Specs / Glassware & Ice */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Bar Service Specifications
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Recommended Glassware</label>
              <select
                value={glassware}
                onChange={(e) => setGlassware(e.target.value)}
                className="w-full text-xs font-semibold p-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Highball Glass (350ml)">Highball Glass (350ml)</option>
                <option value="Rocks / Old Fashioned Glass (300ml)">Rocks Glass (300ml)</option>
                <option value="Coupe / Martini Glass (200ml)">Coupe / Martini (200ml)</option>
                <option value="Collins Glass (400ml)">Collins Glass (400ml)</option>
                <option value="Shot Glass (30ml / 60ml)">Shot Glass (30ml / 60ml)</option>
                <option value="Hurricane Glass (450ml)">Hurricane Glass (450ml)</option>
                <option value="Mug / Hot Cup">Mug / Hot Cup</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ice Profile</label>
              <select
                value={iceProfile}
                onChange={(e) => setIceProfile(e.target.value)}
                className="w-full text-xs font-semibold p-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Cubed Ice (75% Fill)">Cubed Ice (75% Fill)</option>
                <option value="Crushed Ice (Full Fill)">Crushed Ice (Full Fill)</option>
                <option value="Large Clear Sphere / Cube">Large Clear Sphere / Cube</option>
                <option value="Neat (No Ice)">Neat (No Ice)</option>
                <option value="Chilled (Strained)">Chilled (Strained)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Garnish & Serving Notes</label>
              <input
                type="text"
                placeholder="e.g. Mint sprig & lime wheel"
                value={garnish}
                onChange={(e) => setGarnish(e.target.value)}
                className="w-full text-xs font-semibold p-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Liquid Ingredients List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pour Ingredients & Mixers ({ingredients.length})
            </span>
            <Button
              type="button"
              variant="primary"
              size="sm"
              rounded="full"
              onClick={handleAddIngredient}
              className="flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs shadow-none"
            >
              <PlusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Liquid Ingredient</span>
            </Button>
          </div>

          {ingredients.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
              No pour ingredients added yet. Click "Add Liquid Ingredient" to link stocked bottles (e.g. Coca-Cola, Rum, Vodka, Tonic, Syrups).
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {ingredients.map((ing, idx) => {
                const selectedItem = inventoryItems.find((i: any) => i.id === Number(ing.inventory_item_id));
                const selectedUom = uoms.find((u: any) => u.id === Number(ing.uom_id));

                // Find if a Global Bar Rule governs this liquid
                const matchedRule = barRules.find(
                  (r) =>
                    r.primaryInventoryItemId === selectedItem?.id ||
                    r.fallbackInventoryItemId === selectedItem?.id ||
                    (selectedItem && r.beverageName.toLowerCase() === selectedItem.name.toLowerCase())
                );

                const ruledItem = matchedRule?.primaryInventoryItemId
                  ? inventoryItems.find((i) => i.id === matchedRule.primaryInventoryItemId) || selectedItem
                  : selectedItem;

                const packSize = ruledItem?.packSize || (ruledItem as any)?.pack_size;
                let effectiveCostPerMl = Number(ruledItem?.unitCost || (ruledItem as any)?.unit_cost || 0);
                if (packSize && Number(packSize) > 0) {
                  effectiveCostPerMl = effectiveCostPerMl / Number(packSize);
                }

                const estimatedCost =
                  Number(ing.quantity || 0) *
                  Number(selectedUom?.conversion_factor || 1) *
                  effectiveCostPerMl *
                  (1 + Number(ing.wastage_factor_percent || 0) / 100);

                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5"
                  >
                    <div className="grid grid-cols-12 gap-2 items-center">
                      {/* Item Selector */}
                      <div className="col-span-5 relative">
                        <select
                          value={ing.inventory_item_id}
                          onChange={(e) => {
                            const newId = Number(e.target.value);
                            const found = inventoryItems.find((i: any) => i.id === newId);
                            if (found?.dispenseUomId || (found as any)?.dispense_uom_id) {
                              const updated = [...ingredients];
                              updated[idx] = {
                                ...updated[idx],
                                inventory_item_id: newId,
                                uom_id: found.dispenseUomId || (found as any).dispense_uom_id,
                                quantity: updated[idx].quantity || 100,
                              };
                              setIngredients(updated);
                            } else {
                              handleUpdateIngredient(idx, 'inventory_item_id', newId);
                            }
                          }}
                          className="w-full appearance-none text-xs font-semibold pl-2.5 pr-7 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {inventoryItems.map((item: any) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                              {item.packSize ? ` (${item.packSize} ${item.dispenseUomSymbol || 'ml'})` : ''}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
                          <ChevronDownIcon className="w-3.5 h-3.5 stroke-[2]" />
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="1"
                          placeholder="Qty"
                          value={ing.quantity}
                          onChange={(e) => handleUpdateIngredient(idx, 'quantity', Number(e.target.value))}
                          className="w-full text-xs font-semibold p-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      {/* UOM */}
                      <div className="col-span-3 relative">
                        <select
                          value={ing.uom_id}
                          onChange={(e) => handleUpdateIngredient(idx, 'uom_id', Number(e.target.value))}
                          className="w-full appearance-none text-xs font-semibold pl-2.5 pr-7 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {uoms.map((u: any) => (
                            <option key={u.id} value={u.id}>
                              {u.symbol} ({u.name})
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
                          <ChevronDownIcon className="w-3.5 h-3.5 stroke-[2]" />
                        </div>
                      </div>

                      {/* Delete */}
                      <div className="col-span-2 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Remove ingredient"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Active Bar Rule & Cost Preview Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200 gap-1.5">
                      {matchedRule ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                          <SparklesIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            Global Rule: Prioritizes <strong>{matchedRule.primaryItemName}</strong>
                            {matchedRule.primaryBottleBreakdown?.hasOpenUnit && (
                              <span> ({matchedRule.primaryBottleBreakdown.openUnitRemaining.toFixed(0)} ml open)</span>
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">
                          Cost: Rs. {effectiveCostPerMl.toFixed(3)} / {selectedUom?.symbol || 'unit'}
                        </span>
                      )}

                      <span className="font-extrabold text-emerald-700 self-end sm:self-auto">
                        Subtotal: Rs. {estimatedCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <Button
            type="button"
            variant="primary"
            rounded="full"
            disabled={saveRecipeMutation.isPending}
            isLoading={saveRecipeMutation.isPending}
            onClick={() => saveRecipeMutation.mutate({ ingredients })}
            className="px-5 py-2 text-xs font-bold shadow-none"
          >
            Save Mixology Recipe
          </Button>
        </div>
      </div>
    </Modal>
  );
};
