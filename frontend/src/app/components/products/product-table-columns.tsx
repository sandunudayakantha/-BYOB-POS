import React from 'react';
import { type Column } from '@/atomic/obj.data-table';
import { Badge } from '@/atomic/atm.badge';
import type { ProductModel } from '@/app/models/product.model';
import {
  TrashIcon,
  PencilIcon,
  PhotoIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';

export interface ProductTableColumnsProps {
  featuredSections: any[];
  onView: (product: ProductModel) => void;
  onRecipe: (product: ProductModel) => void;
  onFeature: (product: ProductModel) => void;
  onEdit: (product: ProductModel) => void;
  onDelete: (product: ProductModel) => void;
}

export function buildProductColumns({
  featuredSections,
  onRecipe,
  onFeature,
  onEdit,
  onDelete,
}: ProductTableColumnsProps): Column<ProductModel>[] {
  return [
    {
      key: 'name',
      header: 'Product Details',
      render: (row) => (
        <div className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 overflow-hidden flex-shrink-0 border border-stone-200 dark:border-stone-700 transition group-hover:border-amber-500/50">
            {row.imageUrl || row.image ? (
              <img src={row.imageUrl || row.image} alt={row.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">
                <PhotoIcon className="w-6 h-6" />
              </div>
            )}
          </div>
          <div>
            <div className="font-bold text-stone-900 dark:text-white flex items-center gap-2 group-hover:text-amber-500 transition-colors">
              <span>{row.name}</span>
            </div>
            <div className="text-xs text-stone-400 line-clamp-1">{row.description || 'No description'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <span className="font-semibold text-stone-700 dark:text-stone-300">
          {row.categoryName || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'prepTime',
      header: 'Prep Time',
      render: (row) => <span>{row.prepTime || '15-20 mins'}</span>,
    },
    {
      key: 'available',
      header: 'Availability',
      render: (row) => (
        <Badge variant={row.available ? 'primary' : 'danger'}>
          {row.available ? 'Available' : 'Sold Out'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => {
        const featuredInCount = featuredSections.filter((s: any) =>
          s.products?.some((p: any) => String(p._id || p.id || p) === String(row.id))
        ).length;

        return (
          <div className="flex items-center justify-end gap-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onRecipe(row)}
              className="h-7 px-3 rounded-full font-bold text-xs inline-flex items-center gap-1.5 whitespace-nowrap transition bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 active:scale-95 shrink-0"
              title="Configure Ingredients, Kitchen Preps and Food Cost"
            >
              <BeakerIcon className="w-3.5 h-3.5" />
              <span>Recipe</span>
            </button>
            <button
              type="button"
              onClick={() => onFeature(row)}
              className={`h-7 px-3 rounded-full font-bold text-xs inline-flex items-center justify-center whitespace-nowrap transition active:scale-95 shrink-0 border ${
                featuredInCount > 0
                  ? 'bg-amber-500 text-stone-950 border-amber-500 font-extrabold shadow-none'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 hover:text-amber-500 border-stone-200 dark:border-stone-700'
              }`}
              title="Add or remove product from Featured Banners"
            >
              <span>{featuredInCount > 0 ? `Featured (${featuredInCount})` : 'Feature'}</span>
            </button>
            <button
              type="button"
              onClick={() => onEdit(row)}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition shrink-0"
              title="Edit Product"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(row)}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
              title="Delete Product"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];
}
