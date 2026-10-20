import React from 'react';
import { type Column } from '@/atomic/obj.data-table';
import { Badge } from '@/atomic/atm.badge';
import type { ProductModel } from '@/app/models/product.model';
import {
  TrashIcon,
  PencilIcon,
  PhotoIcon,
  EyeIcon,
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
  onView,
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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
            {row.imageUrl || row.image ? (
              <img src={row.imageUrl || row.image} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <PhotoIcon className="w-6 h-6" />
              </div>
            )}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
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
      render: (row) => <span>{row.prepTime || '15-20 mins'}</span>,
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
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onView(row)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              title="View Product Details"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onRecipe(row)}
              className="py-1.5 px-2.5 rounded-lg font-bold text-xs flex items-center gap-1 transition bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
              title="Configure Ingredients, Kitchen Preps and Food Cost"
            >
              <BeakerIcon className="w-3.5 h-3.5" />
              <span>Recipe</span>
            </button>
            <button
              type="button"
              onClick={() => onFeature(row)}
              className={`py-1.5 px-2.5 rounded-lg font-bold text-xs flex items-center gap-1 transition ${
                featuredInCount > 0
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600'
              }`}
              title="Add or remove product from Featured Banners"
            >
              <span>{featuredInCount > 0 ? `Featured (${featuredInCount})` : 'Feature'}</span>
            </button>
            <button
              type="button"
              onClick={() => onEdit(row)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Edit Product"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(row)}
              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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
