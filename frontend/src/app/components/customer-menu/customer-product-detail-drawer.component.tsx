import React from "react";
import { XMarkIcon, ShoppingBagIcon } from "@heroicons/react/24/solid";
import { optimizeImage } from "@/utils/cloudinary";
import type { CustomerProductModel } from "@/app/models/customer-menu.model";

interface CustomerProductDetailDrawerProps {
  product: (CustomerProductModel & { price?: number }) | null;
  isOpen: boolean;
  dragOffsetY: number;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onClose: () => void;
}

export const CustomerProductDetailDrawer: React.FC<CustomerProductDetailDrawerProps> = ({
  product,
  isOpen,
  dragOffsetY,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onClose,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden">
      <div
        className={`fixed inset-0 bg-black/35 transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        style={{
          transform: isOpen ? `translate3d(0, ${dragOffsetY}px, 0)` : "translate3d(0, 100%, 0)",
          transition: dragOffsetY > 0 ? "none" : "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
        className="relative w-full max-w-md bg-[#0a0a0f]/45 backdrop-blur-2xl border-t border-white/25 rounded-t-[32px] p-6 text-white max-h-[88vh] overflow-y-auto z-10 shadow-[0_-20px_60px_rgba(0,0,0,0.95)] touch-pan-y will-change-transform"
      >
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="py-1 -mt-2 mb-2 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="w-12 h-1.5 rounded-full bg-white/35 mx-auto mb-3" />
          <div className="flex items-center justify-between pb-3 border-b border-white/15">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest">
              Item Details
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-5 pt-2">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative w-44 h-44 my-1">
              {product.image ? (
                <img
                  src={optimizeImage(product.image, 600)}
                  alt={product.name}
                  className="w-full h-full rounded-full object-cover shadow-2xl"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                  <ShoppingBagIcon className="w-12 h-12" />
                </div>
              )}
            </div>
            <h3 className="text-xl font-black text-white px-2 leading-snug drop-shadow-md">
              {product.name}
            </h3>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">
              Description
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed bg-black/25 backdrop-blur-lg p-4 rounded-2xl border border-white/10 shadow-inner">
              {product.description ||
                "Freshly prepared with authentic premium ingredients by our head chef."}
            </p>
          </div>

          <div className="pt-1">
            <div className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-xl border border-white/15 shadow-2xl">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Price
              </span>
              <span className="text-xl font-black text-orange-400 mt-0.5 drop-shadow-sm">
                LKR {product.price ? product.price.toFixed(2) : "1,850.00"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
