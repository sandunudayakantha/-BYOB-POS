import React, { useState } from 'react';
import Modal from '@/components/Modal';
import { FormInput, FormSelect } from '@/components/FormFields';
import { Button } from '@/atomic/atm.button';
import type { BarDispenseRuleModel } from '@/app/models/bar-rule.model';
import type { InventoryItemModel } from '@/app/models/inventory.model';
import {
  SparklesIcon,
  BeakerIcon,
  TrashIcon,
  PencilSquareIcon,
  PlusIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export interface BarDispenseRulesModalProps {
  isOpen: boolean;
  branchId: number | string;
  rules: BarDispenseRuleModel[];
  inventoryItems: InventoryItemModel[];
  onClose: () => void;
  onCreateRule: (payload: any) => Promise<any>;
  onUpdateRule: (params: { ruleId: number; payload: any }) => Promise<any>;
  onDeleteRule: (ruleId: number) => Promise<any>;
  isCreating: boolean;
  isUpdating: boolean;
}

export const BarDispenseRulesModal: React.FC<BarDispenseRulesModalProps> = ({
  isOpen,
  rules,
  inventoryItems,
  onClose,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  isCreating,
  isUpdating,
}) => {
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states
  const [beverageName, setBeverageName] = useState('');
  const [brandGroup, setBrandGroup] = useState('');
  const [primaryItemId, setPrimaryItemId] = useState<string>('');
  const [fallbackItemId, setFallbackItemId] = useState<string>('');
  const [shotSingleMl, setShotSingleMl] = useState<string>('25');
  const [shotDoubleMl, setShotDoubleMl] = useState<string>('50');
  const [notes, setNotes] = useState('');

  // Candidates for liquid dispensing (items with pack size or beverage type)
  const beverageItemCandidates = inventoryItems.filter(
    (i) => i.itemType === 'BAR_BEVERAGE' || i.itemType === 'DIRECT_RESALE' || (i.packSize && i.packSize > 0)
  );

  const resetForm = () => {
    setEditingRuleId(null);
    setIsAddingNew(false);
    setBeverageName('');
    setBrandGroup('');
    setPrimaryItemId('');
    setFallbackItemId('');
    setShotSingleMl('25');
    setShotDoubleMl('50');
    setNotes('');
  };

  const handleStartEdit = (rule: BarDispenseRuleModel) => {
    setEditingRuleId(rule.id);
    setIsAddingNew(true);
    setBeverageName(rule.beverageName);
    setBrandGroup(rule.brandGroup || '');
    setPrimaryItemId(String(rule.primaryInventoryItemId));
    setFallbackItemId(rule.fallbackInventoryItemId ? String(rule.fallbackInventoryItemId) : '');
    setShotSingleMl(String(rule.shotSingleMl || 25));
    setShotDoubleMl(String(rule.shotDoubleMl || 50));
    setNotes(rule.notes || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beverageName.trim() || !primaryItemId) {
      toast.error('Please provide a beverage name and select a primary bottle size.');
      return;
    }

    try {
      if (editingRuleId) {
        await onUpdateRule({
          ruleId: editingRuleId,
          payload: {
            beverage_name: beverageName.trim(),
            brand_group: brandGroup.trim() || undefined,
            primary_inventory_item_id: Number(primaryItemId),
            fallback_inventory_item_id: fallbackItemId ? Number(fallbackItemId) : undefined,
            shot_single_ml: Number(shotSingleMl) || 25,
            shot_double_ml: Number(shotDoubleMl) || 50,
            notes: notes.trim() || undefined,
          },
        });
        toast.success('Global bar dispense rule updated!');
      } else {
        await onCreateRule({
          beverage_name: beverageName.trim(),
          brand_group: brandGroup.trim() || undefined,
          primary_inventory_item_id: Number(primaryItemId),
          fallback_inventory_item_id: fallbackItemId ? Number(fallbackItemId) : undefined,
          shot_single_ml: Number(shotSingleMl) || 25,
          shot_double_ml: Number(shotDoubleMl) || 50,
          notes: notes.trim() || undefined,
          is_active: true,
        });
        toast.success('Global bar dispense rule created!');
      }
      resetForm();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save bar dispense rule');
    }
  };

  const handleDelete = async (ruleId: number, name: string) => {
    if (!window.confirm(`Delete global bar dispense rule for "${name}"?`)) return;
    try {
      await onDeleteRule(ruleId);
      toast.success(`Rule for "${name}" removed`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete rule');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Global Bar Dispense & Bottle Opening Settings"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-300/40 dark:border-amber-500/20 text-xs text-stone-700 dark:text-stone-300 flex items-start gap-3">
          <SparklesIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-stone-900 dark:text-white">
              Automated Bottle Uncapping Rules for Mocktails, Cocktails & Shots
            </p>
            <p className="text-stone-500 dark:text-stone-400">
              When orders for mocktails, cocktails, or alcohol shots are billed on the POS, the system automatically checks this rule to know which bottle capacity (e.g. 1L vs 500ml) to crack open from sealed stock.
            </p>
          </div>
        </div>

        {/* Action Bar */}
        {!isAddingNew && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Active Beverage Pouring Rules ({rules.length})
            </span>
            <Button
              type="button"
              variant="primary"
              size="sm"
              rounded="full"
              onClick={() => {
                resetForm();
                setIsAddingNew(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold shadow-none"
            >
              <PlusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Bottle Rule</span>
            </Button>
          </div>
        )}

        {/* Add/Edit Rule Form */}
        {isAddingNew ? (
          <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <span className="text-xs font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                <BeakerIcon className="w-4 h-4 text-cyan-500" />
                <span>{editingRuleId ? `Edit Rule: ${beverageName}` : 'New Beverage Dispense Rule'}</span>
              </span>
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="Beverage / Brand Name"
                placeholder="e.g. Coca-Cola, Absolut Vodka, Bacardi Rum"
                value={beverageName}
                onChange={(e) => setBeverageName(e.target.value)}
                required
              />
              <FormInput
                label="Brand Group / Family (Optional)"
                placeholder="e.g. coca_cola, vodka_absolut"
                value={brandGroup}
                onChange={(e) => setBrandGroup(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormSelect
                label="Primary Packaging Bottle (Ruled to Open)"
                value={primaryItemId}
                onChange={(e) => setPrimaryItemId(e.target.value)}
                options={[
                  { value: '', label: 'Select stocked bottle capacity...' },
                  ...beverageItemCandidates.map((i) => ({
                    value: i.id,
                    label: `${i.name} (Stock: ${Number(i.currentStock).toFixed(2)} ${i.uomSymbol}${
                      i.packSize ? ` • ${i.packSize} ${i.dispenseUomSymbol || 'ml'}` : ''
                    })`,
                  })),
                ]}
                required
              />

              <FormSelect
                label="Fallback Bottle (If Primary is Out of Stock)"
                value={fallbackItemId}
                onChange={(e) => setFallbackItemId(e.target.value)}
                options={[
                  { value: '', label: 'None (Alert when primary is empty)' },
                  ...beverageItemCandidates
                    .filter((i) => String(i.id) !== primaryItemId)
                    .map((i) => ({
                      value: i.id,
                      label: `${i.name} (${Number(i.currentStock).toFixed(2)} ${i.uomSymbol})`,
                    })),
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Standard Single Shot (ml)"
                type="number"
                step="1"
                min="1"
                value={shotSingleMl}
                onChange={(e) => setShotSingleMl(e.target.value)}
                placeholder="25"
              />
              <FormInput
                label="Standard Double Shot (ml)"
                type="number"
                step="1"
                min="1"
                value={shotDoubleMl}
                onChange={(e) => setShotDoubleMl(e.target.value)}
                placeholder="50"
              />
            </div>

            <FormInput
              label="Bar Operation Notes"
              placeholder="e.g. Keep open bottle on speed rail at under 5°C"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-full border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-600 dark:text-stone-300"
              >
                Cancel
              </button>
              <Button
                type="submit"
                variant="primary"
                rounded="full"
                disabled={isCreating || isUpdating}
                isLoading={isCreating || isUpdating}
                className="px-5 py-2 text-xs font-bold shadow-none"
              >
                {editingRuleId ? 'Save Changes' : 'Create Rule'}
              </Button>
            </div>
          </form>
        ) : null}

        {/* Existing Rules List */}
        {rules.length === 0 && !isAddingNew ? (
          <div className="p-8 text-center bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 text-stone-400 text-xs">
            No global bar dispense rules configured yet. Click "Add Bottle Rule" to set default pouring bottles for soft drinks, sodas, and spirits.
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {rules.map((rule) => {
              const pBreakdown = rule.primaryBottleBreakdown;
              return (
                <div
                  key={rule.id}
                  className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-stone-900 dark:text-white">
                        {rule.beverageName}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                        <CheckCircleIcon className="w-3 h-3" />
                        Rule Active
                      </span>
                    </div>

                    <div className="text-xs text-stone-500 dark:text-stone-400 flex flex-wrap items-center gap-3">
                      <span>
                        Primary Bottle:{' '}
                        <strong className="text-stone-900 dark:text-white">
                          {rule.primaryItemName}
                          {rule.primaryPackSize ? ` (${rule.primaryPackSize} ${rule.primaryDispenseUomSymbol || 'ml'})` : ''}
                        </strong>
                      </span>
                      {rule.fallbackItemName && (
                        <span>
                          Fallback:{' '}
                          <strong className="text-stone-700 dark:text-stone-300">
                            {rule.fallbackItemName}
                          </strong>
                        </span>
                      )}
                      <span>
                        Shots: <strong>{rule.shotSingleMl}ml / {rule.shotDoubleMl}ml</strong>
                      </span>
                    </div>

                    {/* Open Bottle Status Pill */}
                    {pBreakdown && (
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-400">
                        <span>📦 {pBreakdown.sealedUnits} Sealed</span>
                        <span>•</span>
                        {pBreakdown.hasOpenUnit ? (
                          <span className="text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1">
                            🍷 Open: {pBreakdown.openUnitRemaining.toFixed(0)} {rule.primaryDispenseUomSymbol || 'ml'} ({pBreakdown.openUnitPercent.toFixed(0)}%)
                          </span>
                        ) : (
                          <span>No bottle currently open</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(rule)}
                      className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-amber-500 transition"
                      title="Edit rule"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rule.id, rule.beverageName)}
                      className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete rule"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
