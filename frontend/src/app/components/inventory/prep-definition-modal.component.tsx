import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { FormInput, FormSelect, FormTextarea } from "@/components/FormFields";
import type {
  InventoryItemModel,
  KitchenPrepDefinitionModel,
  UnitOfMeasureModel,
} from "@/app/models/inventory.model";

export interface PrepDefinitionModalProps {
  isOpen: boolean;
  baseItem: InventoryItemModel | null;
  rawItems?: InventoryItemModel[];
  editingPrep?: KitchenPrepDefinitionModel | null;
  uoms: UnitOfMeasureModel[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    prepId?: number;
    baseRawItemId: number;
    name: string;
    description?: string;
    uomId?: number;
    portionSizeValue?: number;
    portionSizeUomId?: number;
    expectedYieldPercent: number;
    requiresImageEvidence: boolean;
    trackWastage: boolean;
    requiresWastageImage: boolean;
  }) => void;
}

export const PrepDefinitionModal: React.FC<PrepDefinitionModalProps> = ({
  isOpen,
  baseItem,
  rawItems = [],
  editingPrep,
  uoms,
  isPending,
  onClose,
  onSubmit,
}) => {
  const [selectedRawItemId, setSelectedRawItemId] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [expectedYieldPercent, setExpectedYieldPercent] = useState("100");
  const [uomId, setUomId] = useState<string>("");
  const [portionSizeValue, setPortionSizeValue] = useState("");
  const [portionSizeUomId, setPortionSizeUomId] = useState<string>("");
  const [requiresImageEvidence, setRequiresImageEvidence] = useState(false);
  const [trackWastage, setTrackWastage] = useState(false);
  const [requiresWastageImage, setRequiresWastageImage] = useState(false);

  useEffect(() => {
    if (editingPrep) {
      setSelectedRawItemId(String(editingPrep.baseRawItemId));
      setName(editingPrep.name || "");
      setDescription(editingPrep.description || "");
      setExpectedYieldPercent(
        editingPrep.expectedYieldPercent !== undefined
          ? String(editingPrep.expectedYieldPercent)
          : "100"
      );
      setUomId(editingPrep.uomId ? String(editingPrep.uomId) : "");
      setPortionSizeValue(
        editingPrep.portionSizeValue !== undefined
          ? String(editingPrep.portionSizeValue)
          : ""
      );
      setPortionSizeUomId(
        editingPrep.portionSizeUomId ? String(editingPrep.portionSizeUomId) : ""
      );
      setRequiresImageEvidence(Boolean(editingPrep.requiresImageEvidence));
      setTrackWastage(Boolean(editingPrep.trackWastage));
      setRequiresWastageImage(Boolean(editingPrep.requiresWastageImage));
    } else {
      const defaultItemId = baseItem ? String(baseItem.id) : (rawItems[0] ? String(rawItems[0].id) : "");
      setSelectedRawItemId(defaultItemId);
      setName("");
      setDescription("");
      setExpectedYieldPercent("100");
      setUomId(baseItem?.uomId ? String(baseItem.uomId) : (uoms[0] ? String(uoms[0].id) : ""));
      setPortionSizeValue("");
      setPortionSizeUomId(uoms[0] ? String(uoms[0].id) : "");
      setRequiresImageEvidence(false);
      setTrackWastage(false);
      setRequiresWastageImage(false);
    }
  }, [editingPrep, baseItem, rawItems, isOpen, uoms]);

  if (!isOpen) return null;

  const currentRawItem =
    baseItem || rawItems.find((r) => String(r.id) === selectedRawItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawId = baseItem ? baseItem.id : Number(selectedRawItemId);
    if (!rawId || !name.trim()) return;

    onSubmit({
      prepId: editingPrep?.id,
      baseRawItemId: rawId,
      name: name.trim(),
      description: description.trim() || undefined,
      uomId: uomId ? Number(uomId) : undefined,
      portionSizeValue: portionSizeValue ? Number(portionSizeValue) : undefined,
      portionSizeUomId: portionSizeUomId ? Number(portionSizeUomId) : undefined,
      expectedYieldPercent: Number(expectedYieldPercent) || 100,
      requiresImageEvidence,
      trackWastage,
      requiresWastageImage,
    });
  };

  const title = editingPrep
    ? `Edit Kitchen Prep: ${editingPrep.name}`
    : currentRawItem
    ? `Define Kitchen Prep for ${currentRawItem.name}`
    : "Define New Kitchen Prep";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Base Raw Material */}
        {baseItem ? (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Base Raw Ingredient:</span>
              <span className="ml-1.5 font-bold text-slate-900 dark:text-white">
                {baseItem.name}
              </span>
            </div>
            <div className="text-slate-400">
              Unit: <strong className="text-emerald-600 dark:text-emerald-400">{baseItem.uomSymbol}</strong>
            </div>
          </div>
        ) : (
          <FormSelect
            label="Base Raw Material Ingredient"
            value={selectedRawItemId}
            onChange={(e) => setSelectedRawItemId(e.target.value)}
            options={rawItems.map((r) => ({
              value: r.id,
              label: `${r.name} (${r.uomSymbol || "unit"})`,
            }))}
            required
          />
        )}

        <FormInput
          label="Kitchen Prep Specification Name"
          placeholder="e.g. Trimmed Chicken Breast, Wagyu Burger Patty 150g"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <FormTextarea
          label="Preparation / Trimming Instructions (Optional)"
          placeholder="e.g. Debone whole raw chicken, separate wings and thighs, trim fat from breast fillets."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Expected Yield (%)"
            type="number"
            step="0.1"
            min="1"
            max="500"
            placeholder="100"
            value={expectedYieldPercent}
            onChange={(e) => setExpectedYieldPercent(e.target.value)}
            required
          />

          <FormSelect
            label="Output Tracking Unit (UOM)"
            value={uomId}
            onChange={(e) => setUomId(e.target.value)}
            options={uoms.map((u) => ({
              value: u.id,
              label: `${u.name} (${u.symbol})`,
            }))}
          />
        </div>

        {/* Portion Specs */}
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Portion Weight/Size (Optional)"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 150 (grams/ml)"
            value={portionSizeValue}
            onChange={(e) => setPortionSizeValue(e.target.value)}
          />

          <FormSelect
            label="Portion Unit"
            value={portionSizeUomId}
            onChange={(e) => setPortionSizeUomId(e.target.value)}
            options={[
              { value: "", label: "Same as Output UOM" },
              ...uoms.map((u) => ({ value: u.id, label: `${u.name} (${u.symbol})` })),
            ]}
          />
        </div>

        {/* Governance Checkboxes */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Kitchen Evidence & Wastage Governance
          </label>

          <div className="flex items-center gap-2">
            <input
              id="prep-requires-image"
              type="checkbox"
              checked={requiresImageEvidence}
              onChange={(e) => setRequiresImageEvidence(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label
              htmlFor="prep-requires-image"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Require chef photo evidence of prepared yield when logging batches
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="prep-track-wastage"
              type="checkbox"
              checked={trackWastage}
              onChange={(e) => setTrackWastage(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label
              htmlFor="prep-track-wastage"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Track trimming loss and wastage logs for this prep recipe
            </label>
          </div>

          {trackWastage && (
            <div className="flex items-center gap-2 ml-5">
              <input
                id="prep-requires-wastage-image"
                type="checkbox"
                checked={requiresWastageImage}
                onChange={(e) => setRequiresWastageImage(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label
                htmlFor="prep-requires-wastage-image"
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Require photo evidence for trimmed wastage
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {isPending
              ? "Saving Kitchen Prep..."
              : editingPrep
              ? "Save Changes"
              : "Create Kitchen Prep"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
