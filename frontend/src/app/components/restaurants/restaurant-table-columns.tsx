import React from 'react';
import { type Column } from '@/atomic/obj.data-table';
import { Badge } from '@/atomic/atm.badge';
import type { RestaurantModel } from '@/app/models/restaurant.model';
import { KeyIcon, NoSymbolIcon, CheckIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

export interface RestaurantTableColumnsProps {
  onOpenResetPass: (rest: RestaurantModel) => void;
  onOpenLimitModal: (rest: RestaurantModel) => void;
  onToggleStatus: (rest: RestaurantModel) => void;
  onDelete: (rest: RestaurantModel) => void;
}

export function buildRestaurantColumns({
  onOpenResetPass,
  onOpenLimitModal,
  onToggleStatus,
  onDelete,
}: RestaurantTableColumnsProps): Column<RestaurantModel>[] {
  return [
    {
      key: 'name',
      header: 'Restaurant',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-500">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white">{row.name}</div>
            <div className="text-xs text-slate-400">Created {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Recently'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner Details',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{row.ownerName || '—'}</div>
          <div className="text-xs text-slate-400">{row.ownerEmail || '—'}</div>
        </div>
      ),
    },
    {
      key: 'branches',
      header: 'Branches Allocation',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {row.branchesCount ?? 0} / {row.maxBranches ?? 3}
          </span>
          <button
            type="button"
            onClick={() => onOpenLimitModal(row)}
            className="p-1 rounded text-slate-400 hover:text-amber-500"
            title="Edit branch quota"
          >
            <PencilIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'danger'}>
          {row.status}
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
            onClick={() => onOpenResetPass(row)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Reset Owner Password"
          >
            <KeyIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus(row)}
            className={`p-1.5 rounded-lg border transition ${
              row.status === 'ACTIVE'
                ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10'
                : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title={row.status === 'ACTIVE' ? 'Suspend Restaurant' : 'Activate Restaurant'}
          >
            {row.status === 'ACTIVE' ? <NoSymbolIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => onDelete(row)}
            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
            title="Delete Tenant Restaurant"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];
}
