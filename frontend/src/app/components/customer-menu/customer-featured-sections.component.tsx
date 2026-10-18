import React from "react";
import { ShoppingBagIcon } from "@heroicons/react/24/solid";
import { optimizeImage } from "@/utils/cloudinary";
import type { CustomerFeaturedSectionModel, CustomerMenuItemModel, CustomerProductModel } from "@/app/models/customer-menu.model";

interface CustomerFeaturedSectionsProps {
  featuredSections: CustomerFeaturedSectionModel[];
  menuItemsList: CustomerMenuItemModel[];
  onOpenProductDetail: (productWithPrice: CustomerProductModel & { price?: number }) => void;
}

export const CustomerFeaturedSections: React.FC<CustomerFeaturedSectionsProps> = ({
  featuredSections,
  menuItemsList,
  onOpenProductDetail,
}) => {
  return (
    <div className="space-y-3">
      {featuredSections.map((sec) => (
        <div key={sec._id} className="space-y-3">
          <div className="flex items-center px-1">
            <h3 className="font-black text-sm text-white tracking-wide">{sec.title}</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
            {sec.products?.map((prod) => {
              const matchedItem = menuItemsList.find((mi) => (mi.product?._id || (mi as any)._id) === prod._id);
              const itemPrice = matchedItem ? matchedItem.price : 0;

              return (
                <div
                  key={prod._id}
                  onClick={() => onOpenProductDetail({ ...prod, price: itemPrice })}
                  className="w-52 flex-shrink-0 bg-[#16161A] rounded-3xl p-4 border border-slate-800/80 hover:border-orange-500/50 transition-all group cursor-pointer shadow-xl relative overflow-hidden flex flex-col items-center text-center"
                >
                  <div className="relative w-32 h-32 mb-3">
                    {prod.image ? (
                      <img
                        src={optimizeImage(prod.image, 300)}
                        alt={prod.name}
                        className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-all duration-300 shadow-2xl"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                        <ShoppingBagIcon className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-extrabold text-xs text-white group-hover:text-orange-400 transition leading-snug line-clamp-2 w-full">
                    {prod.name}
                  </h4>
                  <div className="mt-3 w-full flex items-center justify-center pt-2 border-t border-slate-800">
                    <span className="font-black text-xs text-orange-400">
                      LKR {itemPrice > 0 ? itemPrice.toFixed(2) : "1,850.00"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
