import React from 'react';
import { type Column } from '@/atomic/obj.data-table';
import { Badge } from '@/atomic/atm.badge';
import type { BranchModel } from '@/app/models/branch.model';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export interface BranchTableColumnsProps {
  onEdit: (branch: BranchModel) => void;
  onDelete: (branch: BranchModel) => void;
}

export function buildBranchColumns({
  onEdit,
  onDelete,
}: BranchTableColumnsProps): Column<BranchModel>[] {
  return [
    {
      key: 'name',
      header: 'Branch & Branding',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.logo ? (
            <img
              src={row.logo}
              alt={row.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/30 flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold flex items-center justify-center flex-shrink-0">
              {row.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <span>{row.name}</span>
              {row.isMain && (
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500 text-stone-950 font-extrabold shadow-sm">
                  Main
                </span>
              )}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">{row.phone || 'No phone'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'coverImage',
      header: 'Cover Banner',
      render: (row) =>
        row.coverImage ? (
          <img
            src={row.coverImage}
            alt="Banner"
            className="w-24 h-10 rounded-xl object-cover ring-1 ring-stone-200 dark:ring-stone-700 shadow-sm"
          />
        ) : (
          <span className="text-xs text-stone-400 dark:text-stone-500 italic">No Banner</span>
        ),
    },
    {
      key: 'address',
      header: 'Address',
      render: (row) => <span className="text-stone-700 dark:text-stone-300 font-medium">{row.address || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'primary' : 'default'}>{row.status}</Badge>
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
            className="p-1.5 rounded-full border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition-colors"
            title="Edit Branch & Branding"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          {!row.isMain && (
            <button
              type="button"
              onClick={() => onDelete(row)}
              className="p-1.5 rounded-full border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Branch"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];
}
