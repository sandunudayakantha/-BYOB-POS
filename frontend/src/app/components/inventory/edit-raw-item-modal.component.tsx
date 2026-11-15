import React, { useState } from "react";
import Modal from "@/components/Modal";
import { FormInput, FormSelect } from "@/components/FormFields";
import { Button } from "@/atomic/atm.button";
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
    packSize?: number;
    dispenseUomId?: number;
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
  const [packSize, setPackSize] = useState<string>(item?.packSize ? String(item.packSize) : "1000");
  const [dispenseUomId, setDispenseUomId] = useState<string>(item?.dispenseUomId ? String(item.dispenseUomId) : "");

  React.useEffect(() => {
    if (item) {
      setName(item.name || "");
      setSku(item.sku || "");
      setSupplierId(item.supplierId ? String(item.supplierId) : "");
      setUomId(item.uomId ? String(item.uomId) : "");
      setReorderThreshold(item.reorderThreshold !== undefined ? String(item.reorderThreshold) : "0");
      setIsActive(item.isActive ?? true);
      setPackSize(item.packSize ? String(item.packSize) : "1000");
      setDispenseUomId(item.dispenseUomId ? String(item.dispenseUomId) : "");
    }
  }, [item]);

  if (!isOpen || !item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Item: ${item.name}`}>
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
            packSize: item.itemType === "BAR_BEVERAGE" ? Number(packSize) || undefined : undefined,
            dispenseUomId: item.itemType === "BAR_BEVERAGE" && dispenseUomId ? Number(dispenseUomId) : undefined,
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

        {item.itemType === "BAR_BEVERAGE" && (
          <div className="p-3.5 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200/80 dark:border-cyan-900/40 space-y-3">
            <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300 block">
              Dual-Unit Dispensing Configuration
            </span>
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label={`Capacity per ${item.uomSymbol || "Bottle"}`}
                type="number"
                step="1"
                min="1"
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
                placeholder="1000"
                required
              />
              <FormSelect
                label="Dispense / Pour Unit"
                value={dispenseUomId}
                onChange={(e) => setDispenseUomId(e.target.value)}
                options={uoms.map((u) => ({ value: u.id, label: `${u.name} (${u.symbol})` }))}
                required
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <input
            id="edit-is-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded text-amber-500 accent-amber-500 focus:ring-amber-500"
          />
          <label
            htmlFor="edit-is-active"
            className="text-xs font-bold text-stone-700 dark:text-stone-300 cursor-pointer"
          >
            Item is Active for Kitchen Preps & Catalog Recipes
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          rounded="full"
          disabled={isPending}
          isLoading={isPending}
          className="w-full py-3 font-bold text-sm shadow-none"
        >
          {isPending ? "Saving Changes..." : "Save Item Changes"}
        </Button>
      </form>
    </Modal>
  );
};
