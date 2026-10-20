import React, { useState } from "react";
import Modal from "@/components/Modal";
import { FormInput, FormSelect } from "@/components/FormFields";
import type { UnitOfMeasureModel, SupplierModel } from "@/app/models/inventory.model";

export interface CreateRawItemModalProps {
  isOpen: boolean;
  uoms: UnitOfMeasureModel[];
  suppliers: SupplierModel[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    sku?: string;
    supplierId?: number;
    uomId: number;
    itemType: string;
    currentStock: number;
    reorderThreshold: number;
    unitCost: number;
    isActive: boolean;
  }) => void;
}

export const CreateRawItemModal: React.FC<CreateRawItemModalProps> = ({
  isOpen,
  uoms,
  suppliers,
  isPending,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [uomId, setUomId] = useState<string>("");
  const [currentStock, setCurrentStock] = useState<string>("0");
  const [unitCost, setUnitCost] = useState<string>("0");
  const [reorderThreshold, setReorderThreshold] = useState<string>("0");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Set default UOM when uoms become available
  React.useEffect(() => {
    if (uoms.length > 0 && !uomId) {
      setUomId(String(uoms[0].id));
    }
  }, [uoms, uomId]);

  const resetForm = () => {
    setName("");
    setSku("");
    setSupplierId("");
    setUomId(uoms.length > 0 ? String(uoms[0].id) : "");
    setCurrentStock("0");
    setUnitCost("0");
    setReorderThreshold("0");
    setIsActive(true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !uomId) return;

    onSubmit({
      name: name.trim(),
      sku: sku.trim() || undefined,
      supplierId: supplierId ? Number(supplierId) : undefined,
      uomId: Number(uomId),
      itemType: "RAW_MATERIAL",
      currentStock: Number(currentStock) || 0,
      reorderThreshold: Number(reorderThreshold) || 0,
      unitCost: Number(unitCost) || 0,
      isActive,
    });
  };

  if (!isOpen) return null;

  const selectedUom = uoms.find((u) => String(u.id) === uomId);
  const uomSymbol = selectedUom?.symbol || "units";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Raw Material">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Raw Item Name"
          placeholder="e.g. Whole Raw Chicken, Wagyu Beef, Basmati Rice"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Base Tracking Unit (UOM)"
            value={uomId}
            onChange={(e) => setUomId(e.target.value)}
            options={uoms.map((u) => ({ value: u.id, label: `${u.name} (${u.symbol})` }))}
            required
          />

          <FormSelect
            label="Primary Supplier"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            options={[
              { value: "", label: "None / Direct Purchase" },
              ...suppliers.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="SKU / Barcode"
            placeholder="e.g. CHK-RAW-001"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />

          <FormInput
            label={`Initial Stock (${uomSymbol})`}
            type="number"
            step="0.001"
            min="0"
            value={currentStock}
            onChange={(e) => setCurrentStock(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label={`Unit Cost (Rs. per ${uomSymbol})`}
            type="number"
            step="0.01"
            min="0"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
          />

          <FormInput
            label={`Reorder Alert Threshold (${uomSymbol})`}
            type="number"
            step="0.01"
            min="0"
            value={reorderThreshold}
            onChange={(e) => setReorderThreshold(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            id="create-is-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
          />
          <label
            htmlFor="create-is-active"
            className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Item is Active for Kitchen Preps & Catalog Recipes
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {isPending ? "Adding Item..." : "Add Raw Material"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
