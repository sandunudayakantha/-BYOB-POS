import React, { useState } from "react";
import Modal from "@/components/Modal";
import { FormInput, FormSelect } from "@/components/FormFields";
import type { InventoryItemModel, UnitOfMeasureModel, SupplierModel } from "@/app/models/inventory.model";

interface EditRawItemModalProps {
  isOpen: boolean;
  item: InventoryItemModel | null;
  uoms: UnitOfMeasureModel[];
  suppliers: SupplierModel[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    itemId: number;
    name: string;
    sku?: string;
    supplierId?: number;
    uomId: number;
    reorderThreshold: number;
    isActive: boolean;
  }) => void;
}

export const EditRawItemModal: React.FC<EditRawItemModalProps> = ({
  isOpen,
  item,
  uoms,
  suppliers,
  isPending,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(item?.name || "");
  const [sku, setSku] = useState(item?.sku || "");
  const [supplierId, setSupplierId] = useState<string>(item?.supplierId ? String(item.supplierId) : "");
  const [uomId, setUomId] = useState<string>(item?.uomId ? String(item.uomId) : "");
  const [reorderThreshold, setReorderThreshold] = useState<string>(
    item?.reorderThreshold !== undefined ? String(item.reorderThreshold) : "0"
  );
  const [isActive, setIsActive] = useState<boolean>(item?.isActive ?? true);

  React.useEffect(() => {
    if (item) {
      setName(item.name || "");
      setSku(item.sku || "");
      setSupplierId(item.supplierId ? String(item.supplierId) : "");
      setUomId(item.uomId ? String(item.uomId) : "");
      setReorderThreshold(item.reorderThreshold !== undefined ? String(item.reorderThreshold) : "0");
      setIsActive(item.isActive ?? true);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Raw Material: ${item.name}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            itemId: item.id,
            name,
            sku,
            supplierId: supplierId ? Number(supplierId) : undefined,
            uomId: Number(uomId),
            reorderThreshold: Number(reorderThreshold),
            isActive,
          });
        }}
        className="space-y-4"
      >
        <FormInput
          label="Raw Item Name"
          placeholder="e.g. Whole Raw Chicken"
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
            label={`Reorder Alert Threshold (${item.uomSymbol || "units"})`}
            type="number"
            step="0.01"
            value={reorderThreshold}
            onChange={(e) => setReorderThreshold(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            id="edit-is-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
          />
          <label
            htmlFor="edit-is-active"
            className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Item is Active for Kitchen Preps & Catalog Recipes
          </label>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition"
        >
          {isPending ? "Saving Changes..." : "Save Item Changes"}
        </button>
      </form>
    </Modal>
  );
};
