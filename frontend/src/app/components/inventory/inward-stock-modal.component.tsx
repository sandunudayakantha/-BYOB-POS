import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { FormInput, FormSelect } from "@/components/FormFields";
import { Button } from "@/atomic/atm.button";
import type { InventoryItemModel, SupplierModel } from "@/app/models/inventory.model";

export interface InwardStockModalProps {
  isOpen: boolean;
  item: InventoryItemModel | null;
  suppliers: SupplierModel[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    itemId: number;
    quantityReceived: number;
    unitCost: number;
    supplierId?: number;
    batchNumber?: string;
    receivedDate?: string;
    expiryDate?: string;
    notes?: string;
  }) => void;
}

export const InwardStockModal: React.FC<InwardStockModalProps> = ({
  isOpen,
  item,
  suppliers,
  isPending,
  onClose,
  onSubmit,
}) => {
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [batchNumber, setBatchNumber] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (item) {
      setQuantity("");
      setUnitCost(item.unitCost ? String(item.unitCost) : "0");
      setSupplierId(item.supplierId ? String(item.supplierId) : "");
      setBatchNumber("");
      setReceivedDate(todayStr);
      setExpiryDate("");
      setNotes("");
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const uomLabel = item.uomSymbol || "units";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = Number(quantity);
    if (!qtyNum || qtyNum <= 0) return;

    onSubmit({
      itemId: item.id,
      quantityReceived: qtyNum,
      unitCost: Number(unitCost) || 0,
      supplierId: supplierId ? Number(supplierId) : undefined,
      batchNumber: batchNumber.trim() || undefined,
      receivedDate: receivedDate || todayStr,
      expiryDate: expiryDate || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Stock Inward: ${item.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info Banner */}
        <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs">
          <div>
            <span className="text-stone-400">Current In Stock:</span>
            <span className="ml-1.5 font-bold text-stone-800 dark:text-white">
              {Number(item.currentStock).toFixed(2)} {uomLabel}
            </span>
          </div>
          <div>
            <span className="text-stone-400">Base Unit:</span>
            <span className="ml-1.5 font-bold text-amber-600 dark:text-amber-400">
              {item.uomName || uomLabel} ({uomLabel})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label={`Inward Quantity (${uomLabel})`}
            type="number"
            step="0.001"
            min="0.001"
            placeholder="e.g. 50"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            autoFocus
          />

          <FormInput
            label={`Purchase Unit Cost (Rs. per ${uomLabel})`}
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 250.00"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Supplier"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            options={[
              { value: "", label: "None / Direct Purchase" },
              ...suppliers.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />

          <FormInput
            label="Batch / Lot Number (Optional)"
            placeholder="e.g. LOT-2026-A1"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Received Date"
            type="date"
            value={receivedDate}
            onChange={(e) => setReceivedDate(e.target.value)}
          />

          <FormInput
            label="Expiry Date (Optional)"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>

        <FormInput
          label="Notes / Delivery Reference (Optional)"
          placeholder="e.g. Delivered via vendor invoice #9812"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            Cancel
          </button>
          <Button
            type="submit"
            variant="primary"
            rounded="full"
            disabled={isPending || !Number(quantity)}
            isLoading={isPending}
            className="px-5 py-2.5 font-bold text-xs shadow-none"
          >
            {isPending ? "Recording Inward Stock..." : "Record Inward Stock"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
