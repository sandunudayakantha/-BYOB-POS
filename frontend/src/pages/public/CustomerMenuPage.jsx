import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import api from '../../services/api';
import Modal from '../../components/Modal';
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  InformationCircleIcon,
  XMarkIcon,
  PhoneIcon
} from '@heroicons/react/24/solid';
import { optimizeImage } from '../../utils/cloudinary';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const CustomerMenuPage = () => {
  const { token } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProduct]);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 0) {
      setDragOffsetY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragOffsetY > 75) {
      handleCloseProductDetail();
    }
    setDragOffsetY(0);
  };

  const handleOpenProductDetail = (productWithPrice) => {
    setSelectedProduct(productWithPrice);
    setIsDrawerOpen(false);
    setDragOffsetY(0);
    setTimeout(() => {
      setIsDrawerOpen(true);
    }, 20);
  };

  const handleCloseProductDetail = () => {
    setIsDrawerOpen(false);
    setDragOffsetY(0);
    setTimeout(() => {
      setSelectedProduct(null);
    }, 300);
  };

  // Server-Side Paginated State
  const [page, setPage] = useState(1);
  const [menuData, setMenuData] = useState(null);
  const [menuItemsList, setMenuItemsList] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [error, setError] = useState(null);
  const loadMoreRef = useRef(null);

  // Reset pagination on category or search change
  const handleCategorySelect = (catId) => {
    setSelectedCategoryId(catId);
    setPage(1);
    setMenuItemsList([]);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setPage(1);
    setMenuItemsList([]);
  };

  // Fetch Paginated Menu Items from Server
  useEffect(() => {
    let isCancelled = false;

    const fetchMenuPage = async () => {
      if (page === 1 && menuItemsList.length === 0) {
        setInitialLoading(true);
      } else {
        setIsFetchingNextPage(true);
      }

      try {
        const res = await api.get(`/public/menu/${token}`, {
          params: {
            page,
            limit: 10,
            categoryId: selectedCategoryId,
            search: searchQuery
          }
        });

        if (!isCancelled) {
          const payload = res?.data?.data || res?.data;
          if (!payload || typeof payload !== 'object') {
            throw new Error('Menu data is empty or invalid');
          }

          const itemsRaw = payload.menuItems || payload.items || [];
          if (page === 1) {
            setMenuData(payload);
            setMenuItemsList(itemsRaw);
          } else {
            setMenuItemsList((prev) => {
              // Deduplicate by _id
              const existingIds = new Set(prev.map((i) => i._id));
              const newItems = itemsRaw.filter((i) => !existingIds.has(i._id));
              return [...prev, ...newItems];
            });
          }

          setHasMore(payload.meta?.hasMore || false);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          const errMsg = err?.message || err?.detail || 'The scanned QR code is invalid, inactive, or the menu is currently offline.';
          setError(typeof err === 'string' ? new Error(err) : { ...err, message: errMsg });
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

  // IntersectionObserver for Infinite Scroll Sentinel Trigger
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingNextPage && !initialLoading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
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
          {error?.response?.data?.message || error?.message || 'The scanned QR code is invalid, inactive, or the menu is currently offline.'}
        </p>
      </div>
    );
  }

  const { restaurant, branch, menu, tableName, categories = [], featuredSections = [], meta = {} } = menuData;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white pb-4 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Dribbble-Style Brand Header */}
      <div className="relative border-b border-slate-900 overflow-hidden bg-gradient-to-b from-[#141418] to-[#0B0B0D]">
        {branch?.coverImage && (
          <div className="absolute inset-0 opacity-15">
            <img src={optimizeImage(branch.coverImage, 800)} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/80 to-transparent" />
          </div>
        )}

        <div className="relative max-w-md mx-auto px-5 pt-8 pb-6 space-y-4">
          {/* Top Bar: Logo & Branch Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {branch?.logo || restaurant?.logo ? (
                <img src={optimizeImage(branch?.logo || restaurant?.logo, 150)} alt={restaurant?.name} className="w-16 h-16 rounded-full object-cover shadow-xl flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-black text-2xl shadow-xl flex-shrink-0">
                  {restaurant?.name?.charAt(0) || 'R'}
                </div>
              )}
              <div>
                <h1 className="text-lg font-black tracking-tight text-white">{restaurant?.name}</h1>
                <p className="text-xs font-bold text-orange-400 tracking-wider uppercase mt-0.5">{branch?.name || 'Gourmet Dining'}</p>
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

      {/* Sticky Search & Category Navigation Bar */}
      <div className="sticky top-0 z-30 bg-[#0B0B0D] border-b border-slate-800/90 py-3 shadow-2xl">
        <div className="max-w-md mx-auto px-4 space-y-3">
          {/* Instant Search Bar */}
          <div className="relative flex items-center">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search sushi, rolls, beverages..."
              className="w-full pl-12 pr-11 py-3 rounded-full bg-[#16161A] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/80 text-xs font-medium transition shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="w-6 h-6 rounded-full bg-slate-800/90 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center absolute right-3.5 transition shadow-sm"
                title="Clear search"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Horizontal Pills */}
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none items-center">
            <button
              onClick={() => handleCategorySelect('ALL')}
              className={`px-5 py-2.5 rounded-full text-xs font-black transition-all whitespace-nowrap flex-shrink-0 inline-flex items-center justify-center text-center ${
                selectedCategoryId === 'ALL'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-[#16161A] text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              All Types
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategorySelect(cat._id)}
                className={`px-5 py-2.5 rounded-full text-xs font-black transition-all whitespace-nowrap flex-shrink-0 inline-flex items-center justify-center text-center ${
                  selectedCategoryId === cat._id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : 'bg-[#16161A] text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-md mx-auto px-4 pt-5 pb-2 space-y-6">

        {/* Dribbble Style Featured Recommendations Hero Platter Carousel */}
        {featuredSections.length > 0 && !searchQuery && (
          <div className="space-y-3">
            {featuredSections.map((sec) => (
              <div key={sec._id} className="space-y-3">
                <div className="flex items-center px-1">
                  <h3 className="font-black text-sm text-white tracking-wide">{sec.title}</h3>
                </div>

                {/* Carousel Horizontal Scroll Cards */}
                <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
                  {sec.products?.map((prod) => {
                    // Match price from menuItemsList
                    const matchedMenuItem = menuItemsList.find((mi) => (mi.product?._id || mi.product) === prod._id);
                    const itemPrice = matchedMenuItem ? matchedMenuItem.price : 0;

                    return (
                      <div
                        key={prod._id}
                        onClick={() => handleOpenProductDetail({ ...prod, price: itemPrice })}
                        className="w-52 flex-shrink-0 bg-[#16161A] rounded-3xl p-4 border border-slate-800/80 hover:border-orange-500/50 transition-all group cursor-pointer shadow-xl relative overflow-hidden flex flex-col items-center text-center"
                      >
                        {/* Circular Food Platter Hero Thumbnail */}
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

                        {/* Title */}
                        <h4 className="font-extrabold text-xs text-white group-hover:text-orange-400 transition leading-snug line-clamp-2 w-full">
                          {prod.name}
                        </h4>

                        {/* Price Tag */}
                        <div className="mt-3 w-full flex items-center justify-center pt-2 border-t border-slate-800">
                          <span className="font-black text-xs text-orange-400">
                            LKR {itemPrice > 0 ? itemPrice.toFixed(2) : '1,850.00'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Premium A la Carte Catalog List */}
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
                    {/* Left Circular Thumbnail */}
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

                    {/* Middle Info - Full Name */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-xs text-white group-hover:text-orange-400 transition leading-snug">
                        {prod.name}
                      </h4>
                    </div>

                    {/* Right Price Tag */}
                    <div className="flex items-center flex-shrink-0">
                      <span className="font-black text-xs text-orange-400">
                        LKR {item.price ? item.price.toFixed(2) : '1,850.00'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Infinite Scroll Sentinel & Loading Indicator */}
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

      {/* Mobile Bottom Sheet Slider Drawer (Ultra-Glassmorphic 60 FPS Swipe-to-Dismiss) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden">
          {/* Backdrop Overlay - Normal Background Tint (No Blur on Page) */}
          <div
            className={`fixed inset-0 bg-black/35 transition-opacity duration-300 ease-out ${
              isDrawerOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleCloseProductDetail}
          />

          {/* Glassmorphic Drawer Panel - Blurs ONLY content underneath the drawer */}
          <div
            style={{
              transform: isDrawerOpen
                ? `translate3d(0, ${dragOffsetY}px, 0)`
                : 'translate3d(0, 100%, 0)',
              transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)'
            }}
            className="relative w-full max-w-md bg-[#0a0a0f]/45 backdrop-blur-2xl border-t border-white/25 rounded-t-[32px] p-6 text-white max-h-[88vh] overflow-y-auto z-10 shadow-[0_-20px_60px_rgba(0,0,0,0.95)] touch-pan-y will-change-transform"
          >
            {/* Top Pull Handle Header - Swipe Down Region */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="py-1 -mt-2 mb-2 cursor-grab active:cursor-grabbing select-none"
            >
              <div className="w-12 h-1.5 rounded-full bg-white/35 mx-auto mb-3" />

              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest">Item Details</h3>
                <button
                  type="button"
                  onClick={handleCloseProductDetail}
                  className="p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dish Hero & Details Display */}
            <div className="space-y-5 pt-2">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative w-44 h-44 my-1">
                  {selectedProduct.image ? (
                    <img
                      src={optimizeImage(selectedProduct.image, 600)}
                      alt={selectedProduct.name}
                      className="w-full h-full rounded-full object-cover shadow-2xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                      <ShoppingBagIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-black text-white px-2 leading-snug drop-shadow-md">{selectedProduct.name}</h3>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">Description</h4>
                <p className="text-xs text-slate-200 leading-relaxed bg-black/25 backdrop-blur-lg p-4 rounded-2xl border border-white/10 shadow-inner">
                  {selectedProduct.description || 'Freshly prepared with authentic premium ingredients by our head chef.'}
                </p>
              </div>

              {/* Bottom Price Bar */}
              <div className="pt-1">
                <div className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-xl border border-white/15 shadow-2xl">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Price</span>
                  <span className="text-xl font-black text-orange-400 mt-0.5 drop-shadow-sm">
                    LKR {selectedProduct.price ? selectedProduct.price.toFixed(2) : '1,850.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMenuPage;
