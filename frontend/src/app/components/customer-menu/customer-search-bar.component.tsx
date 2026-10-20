import React from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid";
import type { CustomerCategoryModel } from "@/app/models/customer-menu.model";

interface CustomerSearchBarProps {
  searchQuery: string;
  selectedCategoryId: string;
  categories: CustomerCategoryModel[];
  onSearchChange: (value: string) => void;
  onCategorySelect: (categoryId: string) => void;
}

export const CustomerSearchBar: React.FC<CustomerSearchBarProps> = ({
  searchQuery,
  selectedCategoryId,
  categories,
  onSearchChange,
  onCategorySelect,
}) => {
  return (
    <div className="sticky top-0 z-30 bg-[#0B0B0D] border-b border-slate-800/90 py-3 shadow-2xl">
      <div className="max-w-md mx-auto px-4 space-y-3">
        <div className="relative flex items-center">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search dishes, drinks, ingredients..."
            className="w-full pl-12 pr-11 py-3 rounded-full bg-[#16161A] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/80 text-xs font-medium transition shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="w-6 h-6 rounded-full bg-slate-800/90 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center absolute right-3.5 transition shadow-sm"
              title="Clear search"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none items-center">
          <button
            onClick={() => onCategorySelect("ALL")}
            className={`px-5 py-2.5 rounded-full text-xs font-black transition-all whitespace-nowrap flex-shrink-0 inline-flex items-center justify-center text-center ${
              selectedCategoryId === "ALL"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                : "bg-[#16161A] text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white"
            }`}
          >
            All Types
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onCategorySelect(cat._id)}
              className={`px-5 py-2.5 rounded-full text-xs font-black transition-all whitespace-nowrap flex-shrink-0 inline-flex items-center justify-center text-center ${
                selectedCategoryId === cat._id
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                  : "bg-[#16161A] text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
