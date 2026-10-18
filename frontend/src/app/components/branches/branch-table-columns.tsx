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
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30 flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center flex-shrink-0">
              {row.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{row.name}</span>
              {row.isMain && (
                <span className="px-2 py-0.5 text-[10px] rounded-md bg-emerald-600 text-white font-bold">
                  Main
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">{row.phone || 'No phone'}</div>
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
            className="w-24 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm"
          />
        ) : (
          <span className="text-xs text-slate-400 italic">No Banner</span>
        ),
    },
    {
      key: 'address',
      header: 'Address',
      render: (row) => <span>{row.address || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'default'}>{row.status}</Badge>
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
            title="Edit Branch & Branding"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          {!row.isMain && (
            <button
              type="button"
              onClick={() => onDelete(row)}
              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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
