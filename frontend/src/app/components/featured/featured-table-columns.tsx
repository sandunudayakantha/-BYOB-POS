import React from 'react';
import { type Column } from '@/atomic/obj.data-table';
import { Badge } from '@/atomic/atm.badge';
import type { FeaturedSectionModel } from '@/app/models/featured.model';
import { PencilIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

export interface FeaturedTableColumnsProps {
  onOpenProducts: (section: FeaturedSectionModel) => void;
  onEdit: (section: FeaturedSectionModel) => void;
  onDelete: (section: FeaturedSectionModel) => void;
  onToggleStatus: (section: FeaturedSectionModel) => void;
}

export function buildFeaturedColumns({
  onOpenProducts,
  onEdit,
  onDelete,
  onToggleStatus,
}: FeaturedTableColumnsProps): Column<FeaturedSectionModel>[] {
  return [
    {
      key: 'title',
      header: 'Banner Title',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white block">{row.title}</span>
          <span className="text-xs text-slate-400">{row.description || 'No description'}</span>
        </div>
      ),
    },
    {
      key: 'products',
      header: 'Featured Products',
      render: (row) => {
        const count = row.products?.length || 0;
        return (
          <button
            type="button"
            onClick={() => onOpenProducts(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 hover:text-amber-500 font-bold text-xs transition border border-stone-200 dark:border-stone-700"
          >
            <ShoppingBagIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>{count} Items Assigned</span>
          </button>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <button
          type="button"
          onClick={() => onToggleStatus(row)}
          className="cursor-pointer hover:opacity-80 transition"
          title="Click to toggle status"
        >
          <Badge variant={row.isActive ? 'success' : 'danger'}>
            {row.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(row)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Edit Section"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(row)}
            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Delete Section"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];
}
