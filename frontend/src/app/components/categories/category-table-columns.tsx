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
      render: (row) => <span>{row.displayOrder ?? 0}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'danger'}>
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
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Edit Category"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(row)}
            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Delete Category"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];
}
