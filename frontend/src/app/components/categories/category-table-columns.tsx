import React from 'react';
import { type Column } from '@/atomic/obj.data-table';
import { Badge } from '@/atomic/atm.badge';
import type { CategoryModel } from '@/app/models/product.model';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export interface CategoryTableColumnsProps {
  onEdit: (cat: CategoryModel) => void;
  onDelete: (cat: CategoryModel) => void;
}

export function buildCategoryColumns({
  onEdit,
  onDelete,
}: CategoryTableColumnsProps): Column<CategoryModel>[] {
  return [
    {
      key: 'name',
      header: 'Category Name',
      render: (row) => <span className="font-bold text-slate-900 dark:text-white">{row.name}</span>,
    },
    {
      key: 'displayOrder',
      header: 'Display Priority Order',
      render: (row) => <span className="font-semibold text-slate-700 dark:text-slate-300">{row.displayOrder ?? 0}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'primary' : 'danger'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
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
            className="p-1.5 rounded-full border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition-colors"
            title="Edit Category"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(row)}
            className="p-1.5 rounded-full border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete Category"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];
}
