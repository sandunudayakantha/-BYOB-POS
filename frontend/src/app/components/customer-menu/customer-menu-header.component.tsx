import React from "react";
import { PhoneIcon } from "@heroicons/react/24/solid";
import { optimizeImage } from "@/utils/cloudinary";
import type { CustomerRestaurantModel, CustomerBranchModel } from "@/app/models/customer-menu.model";

interface CustomerMenuHeaderProps {
  restaurant?: CustomerRestaurantModel;
  branch?: CustomerBranchModel;
  tableName?: string;
}

export const CustomerMenuHeader: React.FC<CustomerMenuHeaderProps> = ({
  restaurant,
  branch,
  tableName,
}) => {
  return (
    <div className="relative border-b border-slate-900 overflow-hidden bg-gradient-to-b from-[#141418] to-[#0B0B0D]">
      {branch?.coverImage && (
        <div className="absolute inset-0 opacity-15">
          <img
            src={optimizeImage(branch.coverImage, 800)}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/80 to-transparent" />
        </div>
      )}

      <div className="relative max-w-md mx-auto px-5 pt-8 pb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {branch?.logo || restaurant?.logo ? (
              <img
                src={optimizeImage(branch?.logo || restaurant?.logo || "", 150)}
                alt={restaurant?.name}
                className="w-16 h-16 rounded-full object-cover shadow-xl flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-black text-2xl shadow-xl flex-shrink-0">
                {restaurant?.name?.charAt(0) || "R"}
              </div>
            )}
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">{restaurant?.name}</h1>
              <p className="text-xs font-bold text-orange-400 tracking-wider uppercase mt-0.5">
                {branch?.name || "Gourmet Dining"}
              </p>
              {branch?.phone && (
                <a
                  href={`tel:${branch.phone}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-300 hover:text-orange-400 mt-1.5 transition bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full border border-white/10 shadow-sm"
                  title={`Call ${branch.name}`}
                >
                  <PhoneIcon className="w-3 h-3 text-orange-500" />
                  <span>{branch.phone}</span>
                </a>
              )}
            </div>
          </div>

          {tableName && (
            <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-wider">
              {tableName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
