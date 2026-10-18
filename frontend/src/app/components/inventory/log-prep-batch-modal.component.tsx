import React, { useState } from "react";
import Modal from "@/components/Modal";
import { FormInput } from "@/components/FormFields";
import type { KitchenPrepDefinitionModel } from "@/app/models/inventory.model";

interface LogPrepBatchModalProps {
  isOpen: boolean;
  prep: KitchenPrepDefinitionModel | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    prepDefinitionId: number;
    rawInputQuantity: number;
    actualYieldQuantity: number;
    wastageQuantity?: number;
    wastageReason?: string;
    prepImageUrl?: string;
    wastageImageUrl?: string;
  }) => void;
}

export const LogPrepBatchModal: React.FC<LogPrepBatchModalProps> = ({
  isOpen,
  prep,
  isPending,
  onClose,
  onSubmit,
}) => {
  const [rawInputQuantity, setRawInputQuantity] = useState("");
  const [actualYieldQuantity, setActualYieldQuantity] = useState("");
  const [wastageQuantity, setWastageQuantity] = useState("");
  const [wastageReason, setWastageReason] = useState("");
  const [prepImageUrl, setPrepImageUrl] = useState("");
  const [wastageImageUrl, setWastageImageUrl] = useState("");

  React.useEffect(() => {
    if (prep) {
      setRawInputQuantity("");
      setActualYieldQuantity("");
      setWastageQuantity("");
      setWastageReason("");
      setPrepImageUrl("");
      setWastageImageUrl("");
    }
  }, [prep]);

  if (!isOpen || !prep) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Log Preparation Batch: ${prep.name}`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            prepDefinitionId: prep.id,
            rawInputQuantity: Number(rawInputQuantity),
            actualYieldQuantity: Number(actualYieldQuantity),
            wastageQuantity: wastageQuantity ? Number(wastageQuantity) : undefined,
            wastageReason: wastageReason || undefined,
            prepImageUrl: prepImageUrl || undefined,
            wastageImageUrl: wastageImageUrl || undefined,
          });
        }}
        className="space-y-4"
      >
        {prep.portionSizeValue && (
          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <div>
              <span className="font-bold block">Portion Sized Item</span>
              <span>
                Standard portion:{" "}
                <strong>
                  {Number(prep.portionSizeValue)} {prep.portionSizeUomSymbol || "g"}
                </strong>{" "}
                per {prep.uomSymbol || "portion"}
              </span>
            </div>
            {parseFloat(rawInputQuantity) > 0 && (
              <div className="text-right">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 block uppercase font-bold">
                  Expected Portions
                </span>
                <span className="font-extrabold text-sm text-amber-900 dark:text-amber-200">
                  ~
                  {(() => {
                    const rawNum = parseFloat(rawInputQuantity) || 0;
                    const yieldTarget = (Number(prep.expectedYieldPercent) || 100) / 100;
                    const portionVal = Number(prep.portionSizeValue) || 0;
                    const pSym = (prep.portionSizeUomSymbol || "").toLowerCase();
                    const rawSym = (prep.baseRawItemUomSymbol || "").toLowerCase();
                    let factor = 1;
                    if ((rawSym === "kg" && pSym === "g") || (rawSym === "l" && pSym === "ml")) factor = 0.001;
                    else if ((rawSym === "g" && pSym === "kg") || (rawSym === "ml" && pSym === "l")) factor = 1000;
                    const portionInRawUom = portionVal * factor;
                    if (portionInRawUom <= 0) return 0;
                    return Math.round((rawNum * yieldTarget) / portionInRawUom);
                  })()}{" "}
                  {prep.uomSymbol || "portions"}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label={`Raw Input Qty Taken (${
              prep.baseRawItemUomSymbol
                ? `${prep.baseRawItemName} in ${prep.baseRawItemUomSymbol}`
                : prep.baseRawItemName || ""
            })`}
            type="number"
            step="0.01"
            placeholder="e.g. 10.00"
            value={rawInputQuantity}
            onChange={(e) => {
              const rawVal = e.target.value;
              const rawNum = parseFloat(rawVal) || 0;
              const yieldNum = parseFloat(actualYieldQuantity) || 0;

              let calculatedWastage = "0.00";
              if (prep.portionSizeValue) {
                const portionVal = Number(prep.portionSizeValue) || 0;
                const pSym = (prep.portionSizeUomSymbol || "").toLowerCase();
                const rawSym = (prep.baseRawItemUomSymbol || "").toLowerCase();
                let factor = 1;
                if ((rawSym === "kg" && pSym === "g") || (rawSym === "l" && pSym === "ml")) factor = 0.001;
                else if ((rawSym === "g" && pSym === "kg") || (rawSym === "ml" && pSym === "l")) factor = 1000;
                const portionInRawUom = portionVal * factor;
                const consumedRaw = yieldNum * portionInRawUom;
                calculatedWastage = rawNum > consumedRaw ? (rawNum - consumedRaw).toFixed(2) : "0.00";
              } else {
                calculatedWastage = rawNum > yieldNum ? (rawNum - yieldNum).toFixed(2) : "0.00";
              }

              setRawInputQuantity(rawVal);
              if (yieldNum > 0) setWastageQuantity(calculatedWastage);
            }}
            required
          />
          <FormInput
            label={`Actual Yield Produced (${prep.uomSymbol || prep.name || ""})`}
            type="number"
            step="0.01"
            placeholder="e.g. 8.50"
            value={actualYieldQuantity}
            onChange={(e) => {
              const yieldVal = e.target.value;
              const rawNum = parseFloat(rawInputQuantity) || 0;
              const yieldNum = parseFloat(yieldVal) || 0;

              let calculatedWastage = "0.00";
              if (prep.portionSizeValue) {
                const portionVal = Number(prep.portionSizeValue) || 0;
                const pSym = (prep.portionSizeUomSymbol || "").toLowerCase();
                const rawSym = (prep.baseRawItemUomSymbol || "").toLowerCase();
                let factor = 1;
                if ((rawSym === "kg" && pSym === "g") || (rawSym === "l" && pSym === "ml")) factor = 0.001;
                else if ((rawSym === "g" && pSym === "kg") || (rawSym === "ml" && pSym === "l")) factor = 1000;
                const portionInRawUom = portionVal * factor;
                const consumedRaw = yieldNum * portionInRawUom;
                calculatedWastage = rawNum > consumedRaw ? (rawNum - consumedRaw).toFixed(2) : "0.00";
              } else {
                calculatedWastage = rawNum > yieldNum ? (rawNum - yieldNum).toFixed(2) : "0.00";
              }

              setActualYieldQuantity(yieldVal);
              if (rawNum > 0) setWastageQuantity(calculatedWastage);
            }}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Wastage Quantity"
            type="number"
            step="0.01"
            placeholder="e.g. 1.50"
            value={wastageQuantity}
            onChange={(e) => setWastageQuantity(e.target.value)}
            required
          />
          <FormInput
            label="Reason / Trimming Note"
            placeholder="e.g. Bones & skin removed"
            value={wastageReason}
            onChange={(e) => setWastageReason(e.target.value)}
          />
        </div>

        {prep.requiresWastageImage && (
          <FormInput
            label="Wastage Photo URL (Required Proof)"
            placeholder="https://... or image storage URL"
            value={wastageImageUrl}
            onChange={(e) => setWastageImageUrl(e.target.value)}
            required
          />
        )}

        {prep.requiresImageEvidence && (
          <FormInput
            label="Prep Batch Image Evidence URL (Mandatory)"
            placeholder="https://... or uploaded image URL"
            value={prepImageUrl}
            onChange={(e) => setPrepImageUrl(e.target.value)}
            required
          />
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition"
        >
          {isPending ? "Processing Batch..." : "Confirm Batch & Update Stock"}
        </button>
      </form>
    </Modal>
  );
};
