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
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 transition group-hover:border-emerald-500/50">
            {row.imageUrl || row.image ? (
              <img src={row.imageUrl || row.image} alt={row.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <PhotoIcon className="w-6 h-6" />
              </div>
            )}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              <span>{row.name}</span>
            </div>
            <div className="text-xs text-slate-400 line-clamp-1">{row.description || 'No description'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {row.categoryName || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'prepTime',
      header: 'Prep Time',
      render: (row) => <span className="text-slate-500 dark:text-slate-400 font-medium">{row.prepTime || '15-20 mins'}</span>,
    },
    {
      key: 'available',
      header: 'Availability',
      render: (row) => (
        <Badge variant={row.available ? 'success' : 'danger'}>
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
              className="h-7 px-3 rounded-full font-bold text-xs inline-flex items-center gap-1.5 whitespace-nowrap transition bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 active:scale-95 shrink-0"
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
                  ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
              }`}
              title="Add or remove product from Featured Banners"
            >
              <span>{featuredInCount > 0 ? `Featured (${featuredInCount})` : 'Feature'}</span>
            </button>
            <button
              type="button"
              onClick={() => onEdit(row)}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition shrink-0"
              title="Edit Product"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(row)}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 transition shrink-0"
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
