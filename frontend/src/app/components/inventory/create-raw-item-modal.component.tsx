import React, { useState } from "react";
import Modal from "@/components/Modal";
import { FormInput, FormSelect } from "@/components/FormFields";
import { Button } from "@/atomic/atm.button";
import type { UnitOfMeasureModel, SupplierModel, ItemType } from "@/app/models/inventory.model";
import type { CategoryModel } from "@/app/models/product.model";
import { SparklesIcon, InformationCircleIcon, BuildingStorefrontIcon, CakeIcon, BeakerIcon } from "@heroicons/react/24/outline";

export interface CreateRawItemModalProps {
  isOpen: boolean;
  uoms: UnitOfMeasureModel[];
  suppliers: SupplierModel[];
  categories?: CategoryModel[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    sku?: string;
    supplierId?: number;
    uomId: number;
    itemType: ItemType;
    currentStock: number;
    reorderThreshold: number;
    unitCost: number;
    isActive: boolean;
    packSize?: number;
    dispenseUomId?: number;
    autoCreateMenuProduct?: boolean;
    sellingPrice?: number;
    categoryId?: number;
  }) => void;
}

export const CreateRawItemModal: React.FC<CreateRawItemModalProps> = ({
  isOpen,
  uoms,
  suppliers,
  categories = [],
  isPending,
  onClose,
  onSubmit,
}) => {
  const [itemType, setItemType] = useState<ItemType>("RAW_MATERIAL");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [uomId, setUomId] = useState<string>("");
  const [currentStock, setCurrentStock] = useState<string>("0");
  const [unitCost, setUnitCost] = useState<string>("0");
  const [reorderThreshold, setReorderThreshold] = useState<string>("0");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Dual-unit Bar Beverage states
  const [packSize, setPackSize] = useState<string>("1000");
  const [dispenseUomId, setDispenseUomId] = useState<string>("");

  // Direct Resale auto-create states
  const [autoCreateMenuProduct, setAutoCreateMenuProduct] = useState<boolean>(true);
  const [sellingPrice, setSellingPrice] = useState<string>("0");
  const [categoryId, setCategoryId] = useState<string>("");

  // Auto-select sensible defaults when uoms or itemType change
  React.useEffect(() => {
    if (uoms.length === 0) return;

    if (!uomId) {
      // Find bottle or can for bar/direct, else first uom
      const bottleUom = uoms.find((u) => u.name.toLowerCase().includes("bottle") || u.symbol.toLowerCase() === "btl");
      const firstUom = bottleUom || uoms[0];
      setUomId(String(firstUom.id));
    }

    if (!dispenseUomId) {
      // Find ml for liquid dispense
      const mlUom = uoms.find((u) => u.symbol.toLowerCase() === "ml");
      if (mlUom) {
        setDispenseUomId(String(mlUom.id));
      } else if (uoms.length > 1) {
        setDispenseUomId(String(uoms[1].id));
      }
    }
  }, [uoms, uomId, dispenseUomId]);

  // When categories load, default to first category
  React.useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(String(categories[0].id || (categories[0] as any)._id || ""));
    }
  }, [categories, categoryId]);

  const resetForm = () => {
    setItemType("RAW_MATERIAL");
    setName("");
    setSku("");
    setSupplierId("");
    setUomId(uoms.length > 0 ? String(uoms[0].id) : "");
    setCurrentStock("0");
    setUnitCost("0");
    setReorderThreshold("0");
    setIsActive(true);
    setPackSize("1000");
    setAutoCreateMenuProduct(true);
    setSellingPrice("0");
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
      itemType,
      currentStock: Number(currentStock) || 0,
      reorderThreshold: Number(reorderThreshold) || 0,
      unitCost: Number(unitCost) || 0,
      isActive,
      packSize: itemType === "BAR_BEVERAGE" ? Number(packSize) || undefined : undefined,
      dispenseUomId: itemType === "BAR_BEVERAGE" && dispenseUomId ? Number(dispenseUomId) : undefined,
      autoCreateMenuProduct: itemType === "DIRECT_RESALE" ? autoCreateMenuProduct : undefined,
      sellingPrice: itemType === "DIRECT_RESALE" && autoCreateMenuProduct ? Number(sellingPrice) || 0 : undefined,
      categoryId: itemType === "DIRECT_RESALE" && autoCreateMenuProduct && categoryId ? Number(categoryId) : undefined,
    });
  };

  if (!isOpen) return null;

  const selectedUom = uoms.find((u) => String(u.id) === uomId);
  const uomSymbol = selectedUom?.symbol || "units";
  const selectedDispenseUom = uoms.find((u) => String(u.id) === dispenseUomId);
  const dispenseSymbol = selectedDispenseUom?.symbol || "ml";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        itemType === "RAW_MATERIAL"
          ? "Add Kitchen Raw Material"
          : itemType === "DIRECT_RESALE"
          ? "Add Direct Resale / Retail Item"
          : "Add Bar Beverage / Liquid Item"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Type Segmented Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
            Inventory Classification & Usage Mode
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setItemType("RAW_MATERIAL")}
              className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-xs font-bold transition text-center ${
                itemType === "RAW_MATERIAL"
                  ? "bg-white dark:bg-stone-800 text-amber-600 dark:text-amber-400 shadow-sm border border-stone-200/80 dark:border-stone-700"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              <CakeIcon className="w-4 h-4" />
              <span>Kitchen Raw</span>
              <span className="text-[10px] font-normal text-stone-400">Cooking / Preps</span>
            </button>

            <button
              type="button"
              onClick={() => setItemType("DIRECT_RESALE")}
              className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-xs font-bold transition text-center ${
                itemType === "DIRECT_RESALE"
                  ? "bg-white dark:bg-stone-800 text-amber-600 dark:text-amber-400 shadow-sm border border-stone-200/80 dark:border-stone-700"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              <BuildingStorefrontIcon className="w-4 h-4" />
              <span>Direct Resale</span>
              <span className="text-[10px] font-normal text-stone-400">Bottles / Cans</span>
            </button>

            <button
              type="button"
              onClick={() => setItemType("BAR_BEVERAGE")}
              className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-xs font-bold transition text-center ${
                itemType === "BAR_BEVERAGE"
                  ? "bg-white dark:bg-stone-800 text-amber-600 dark:text-amber-400 shadow-sm border border-stone-200/80 dark:border-stone-700"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              <BeakerIcon className="w-4 h-4" />
              <span>Bar Beverage</span>
              <span className="text-[10px] font-normal text-stone-400">Poured / In ml</span>
            </button>
          </div>
        </div>

        {/* Name & SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <FormInput
              label={
                itemType === "RAW_MATERIAL"
                  ? "Raw Item Name"
                  : itemType === "DIRECT_RESALE"
                  ? "Product / Good Name"
                  : "Beverage / Spirit Name"
              }
              placeholder={
                itemType === "RAW_MATERIAL"
                  ? "e.g. Whole Raw Chicken, Wagyu Beef"
                  : itemType === "DIRECT_RESALE"
                  ? "e.g. Coca-Cola 330ml Can, Water Bottle 500ml"
                  : "e.g. Coca-Cola 1L (Bar Dispense), Rum 750ml"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <FormInput
            label="SKU / Barcode"
            placeholder="e.g. COKE-1L"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />
        </div>

        {/* Dual-Unit Dispense Configuration Box for Bar Beverage */}
        {itemType === "BAR_BEVERAGE" && (
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
              <SparklesIcon className="w-4 h-4 text-amber-500" />
              <span>Dual-Unit Dispensing Setup (Storage Unit ⇄ Pouring Volume)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormSelect
                label="Storage Unit (Packaging)"
                value={uomId}
                onChange={(e) => setUomId(e.target.value)}
                options={uoms.map((u) => ({ value: u.id, label: `${u.name} (${u.symbol})` }))}
                required
              />
              <FormInput
                label={`Capacity per ${uomSymbol}`}
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
            <div className="flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-400 bg-white/60 dark:bg-stone-900/60 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
              <InformationCircleIcon className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <span>
                <strong>Smart Liquid Depletion:</strong> 1 {uomSymbol} contains{" "}
                <strong>
                  {packSize || "1000"} {dispenseSymbol}
                </strong>
                . When a cocktail or mocktail order uses 100 {dispenseSymbol}, the system will deduct{" "}
                <strong>{((100 / (Number(packSize) || 1000)) || 0).toFixed(3)} {uomSymbol}</strong>, cleanly tracking sealed
                containers and open poured volume!
              </span>
            </div>
          </div>
        )}

        {/* Direct Resale Auto-Catalog Box */}
        {itemType === "DIRECT_RESALE" && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-300/40 dark:border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-white">
                <BuildingStorefrontIcon className="w-4 h-4 text-amber-500" />
                <span>POS Menu Catalog Integration</span>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCreateMenuProduct}
                  onChange={(e) => setAutoCreateMenuProduct(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-500 focus:ring-amber-500"
                />
                Publish to Menu Catalog
              </label>
            </div>

            {autoCreateMenuProduct && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <FormInput
                  label="Selling Price (Rs.)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="e.g. 250.00"
                  required={autoCreateMenuProduct}
                />
                <FormSelect
                  label="Menu Category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  options={
                    categories.length > 0
                      ? categories.map((c) => ({
                          value: c.id || (c as any)._id,
                          label: c.name,
                        }))
                      : [{ value: "", label: "Default Category" }]
                  }
                />
              </div>
            )}
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              💡 A 1:1 recipe and menu item will be linked automatically. When sold at the register or table, 1 unit will be immediately deducted from inventory.
            </p>
          </div>
        )}

        {/* Base Units & Supplier for Kitchen & Direct Resale */}
        {itemType !== "BAR_BEVERAGE" && (
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Tracking Unit (UOM)"
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
        )}

        {/* Initial Stock & Reorder Threshold */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormInput
            label={`Initial Stock (${uomSymbol})`}
            type="number"
            step="0.001"
            min="0"
            value={currentStock}
            onChange={(e) => setCurrentStock(e.target.value)}
          />
          <FormInput
            label={`Cost / ${uomSymbol} (Rs.)`}
            type="number"
            step="0.01"
            min="0"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
          />
          <FormInput
            label={`Reorder Alert (${uomSymbol})`}
            type="number"
            step="0.01"
            min="0"
            value={reorderThreshold}
            onChange={(e) => setReorderThreshold(e.target.value)}
          />
        </div>

        {/* Supplier for Bar Beverage */}
        {itemType === "BAR_BEVERAGE" && (
          <FormSelect
            label="Primary Supplier"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            options={[
              { value: "", label: "None / Direct Purchase" },
              ...suppliers.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        )}

        {/* Active Toggle */}
        <div className="flex items-center gap-2 pt-1">
          <input
            id="create-is-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded text-amber-500 accent-amber-500 focus:ring-amber-500"
          />
          <label
            htmlFor="create-is-active"
            className="text-xs font-bold text-stone-700 dark:text-stone-300 cursor-pointer"
          >
            Item is Active for Inwarding, Catalog Sales & Bar Dispensing
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200/80 dark:border-stone-800">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-full border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            Cancel
          </button>
          <Button
            type="submit"
            variant="primary"
            rounded="full"
            disabled={isPending}
            isLoading={isPending}
            className="px-5 py-2.5 font-bold text-xs shadow-none"
          >
            {isPending
              ? "Saving..."
              : itemType === "RAW_MATERIAL"
              ? "Add Raw Material"
              : itemType === "DIRECT_RESALE"
              ? "Add Resale Good"
              : "Add Bar Beverage"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

