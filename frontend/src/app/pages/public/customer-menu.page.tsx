import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "@/app/core/http/api-client";
import { CustomerMenuHeader } from "@/app/components/customer-menu/customer-menu-header.component";
import { CustomerSearchBar } from "@/app/components/customer-menu/customer-search-bar.component";
import { CustomerFeaturedSections } from "@/app/components/customer-menu/customer-featured-sections.component";
import { CustomerProductDetailDrawer } from "@/app/components/customer-menu/customer-product-detail-drawer.component";
import { ShoppingBagIcon, InformationCircleIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { optimizeImage } from "@/utils/cloudinary";
import type {
  CustomerMenuResponseModel,
  CustomerMenuItemModel,
  CustomerProductModel,
} from "@/app/models/customer-menu.model";
import { mapCustomerMenuDtoToModel, type CustomerMenuDto } from "@/app/data/http/customer-menu/customer-menu.dto";

export const CustomerMenuPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
  const [selectedProduct, setSelectedProduct] = useState<(CustomerProductModel & { price?: number }) | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    document.body.style.overflow = selectedProduct ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProduct]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) setDragOffsetY(deltaY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragOffsetY > 75) {
      handleCloseProductDetail();
    }
    setDragOffsetY(0);
  };

  const handleOpenProductDetail = (productWithPrice: CustomerProductModel & { price?: number }) => {
    setSelectedProduct(productWithPrice);
    setIsDrawerOpen(false);
    setDragOffsetY(0);
    setTimeout(() => setIsDrawerOpen(true), 20);
  };

  const handleCloseProductDetail = () => {
    setIsDrawerOpen(false);
    setDragOffsetY(0);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const [page, setPage] = useState(1);
  const [menuData, setMenuData] = useState<CustomerMenuResponseModel | null>(null);
  const [menuItemsList, setMenuItemsList] = useState<CustomerMenuItemModel[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [error, setError] = useState<any>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId(catId);
    setPage(1);
    setMenuItemsList([]);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
    setMenuItemsList([]);
  };

  useEffect(() => {
    let isCancelled = false;

    const fetchMenuPage = async () => {
      if (page === 1 && menuItemsList.length === 0) {
        setInitialLoading(true);
      } else {
        setIsFetchingNextPage(true);
      }

      try {
        const res = await apiClient.get<any>(`/public/menu/${token}`, {
          params: { page, limit: 10, categoryId: selectedCategoryId, search: searchQuery },
        });

        if (!isCancelled) {
          const rawPayload: CustomerMenuDto =
            res?.data?.restaurant || res?.data?.menu || res?.data?.menuItems
              ? res.data
              : res?.data?.data || res?.data;
          if (!rawPayload || typeof rawPayload !== "object") {
            throw new Error("Menu data is empty or invalid");
          }
          const mapped = mapCustomerMenuDtoToModel(rawPayload);
          if (page === 1) {
            setMenuData(mapped);
            setMenuItemsList(mapped.menuItems);
          } else {
            setMenuItemsList((prev) => {
              const existingIds = new Set(prev.map((i) => i._id));
              const newItems = mapped.menuItems.filter((i) => !existingIds.has(i._id));
              return [...prev, ...newItems];
            });
          }
          setHasMore(mapped.meta.hasMore);
          setError(null);
        }
      } catch (err: any) {
        if (!isCancelled) {
          const errMsg =
            err?.response?.data?.message ||
            err?.message ||
            err?.detail ||
            "The scanned QR code is invalid, inactive, or the menu is currently offline.";
          setError(typeof err === "string" ? new Error(err) : { ...err, message: errMsg });
        }
      } finally {
        if (!isCancelled) {
          setInitialLoading(false);
          setIsFetchingNextPage(false);
        }
      }
    };

    fetchMenuPage();
    return () => {
      isCancelled = true;
    };
  }, [token, page, selectedCategoryId, searchQuery]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingNextPage && !initialLoading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(sentinel);
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasMore, isFetchingNextPage, initialLoading]);

  if (initialLoading && !menuData) {
    return (
      <div data-testid="loader" className="min-h-screen flex flex-col items-center justify-center bg-[#0B0B0D] text-white p-6 space-y-4 font-sans">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold tracking-widest text-orange-400 uppercase">Preparing Gourmet Menu...</p>
      </div>
    );
  }

  if (error || !menuData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0B0D] text-white p-6 text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-3xl bg-rose-950/60 text-rose-500 flex items-center justify-center border border-rose-800/40">
          <InformationCircleIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Menu Unavailable</h2>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          {error?.response?.data?.message || error?.message || "The scanned QR code is invalid, inactive, or the menu is currently offline."}
        </p>
      </div>
    );
  }

  const { restaurant, branch, tableName, categories, featuredSections, meta } = menuData;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white pb-4 font-sans selection:bg-orange-500 selection:text-white">
      <CustomerMenuHeader restaurant={restaurant} branch={branch} tableName={tableName} />
      <CustomerSearchBar
        searchQuery={searchQuery}
        selectedCategoryId={selectedCategoryId}
        categories={categories}
        onSearchChange={handleSearchChange}
        onCategorySelect={handleCategorySelect}
      />

      <div className="max-w-md mx-auto px-4 pt-5 pb-2 space-y-6">
        {featuredSections.length > 0 && !searchQuery && (
          <CustomerFeaturedSections
            featuredSections={featuredSections}
            menuItemsList={menuItemsList}
            onOpenProductDetail={handleOpenProductDetail}
          />
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-white tracking-wide">Premium A la carte</h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {meta.total !== undefined ? `${meta.total} Total` : `${menuItemsList.length} Items`}
            </span>
          </div>

          {menuItemsList.length === 0 && !isFetchingNextPage ? (
            <div className="p-10 text-center bg-[#16161A] rounded-3xl border border-slate-800 text-slate-500 text-xs">
              No gourmet items match your search.
            </div>
          ) : (
            <div className="space-y-3">
              {menuItemsList.map((item) => {
                const prod = item.product || item;
                if (!prod || !prod.name) return null;

                return (
                  <div
                    key={item._id}
                    onClick={() => handleOpenProductDetail({ ...prod, price: item.price })}
                    className="p-3.5 bg-[#16161A] rounded-3xl border border-slate-800/80 hover:border-orange-500/50 transition-all shadow-xl flex gap-3.5 items-center cursor-pointer group"
                  >
                    <div className="relative w-16 h-16 flex-shrink-0">
                      {prod.image ? (
                        <img
                          src={optimizeImage(prod.image, 150)}
                          alt={prod.name}
                          className="w-full h-full rounded-full object-cover transition-all shadow-lg"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                          <ShoppingBagIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-xs text-white group-hover:text-orange-400 transition leading-snug">
                        {prod.name}
                      </h4>
                    </div>
                    <div className="flex items-center flex-shrink-0">
                      <span className="font-black text-xs text-orange-400">
                        LKR {item.price ? item.price.toFixed(2) : "1,850.00"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div ref={loadMoreRef} className="py-3 flex flex-col items-center justify-center">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-xs text-orange-400 font-bold">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading more gourmet dishes...</span>
              </div>
            )}
            {!hasMore && menuItemsList.length > 0 && (
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block py-2">
                • END OF MENU •
              </span>
            )}
          </div>
        </div>
      </div>

      <CustomerProductDetailDrawer
        product={selectedProduct}
        isOpen={isDrawerOpen}
        dragOffsetY={dragOffsetY}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClose={handleCloseProductDetail}
      />

      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-orange-500 text-white shadow-2xl hover:bg-orange-600 active:scale-95 transition-all duration-300 flex items-center justify-center"
          title="Back to top"
          aria-label="Back to top"
        >
          <ChevronUpIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default CustomerMenuPage;
