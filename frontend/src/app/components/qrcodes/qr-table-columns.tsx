import React from 'react';
import { type Column } from '@/atomic/obj.data-table';
import { Badge } from '@/atomic/atm.badge';
import type { QRCodeModel } from '@/app/models/qrcode.model';
import {
  QrCodeIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon,
  NoSymbolIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export interface QRTableColumnsProps {
  menus?: any[];
  onView: (qr: QRCodeModel) => void;
  onToggleStatus: (qr: QRCodeModel) => void;
  onDelete: (qr: QRCodeModel) => void;
}

export function buildQRColumns({
  menus,
  onView,
  onToggleStatus,
  onDelete,
}: QRTableColumnsProps): Column<QRCodeModel>[] {
  return [
    {
      key: 'token',
      header: 'QR Token & Table',
      render: (row) => {
        const assignedMenuName =
          row.menu?.name ||
          menus?.find((m: any) => String(m.id || m._id) === String(row.menuId))?.name ||
          'Standard Menu';

        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-xs border border-indigo-200 dark:border-indigo-800">
              QR
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Token: {row.token}</span>
                {row.tableName && (
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-normal text-slate-600 dark:text-slate-300">
                    {row.tableName}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400">
                Assigned Menu: {assignedMenuName}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'targetLink',
      header: 'Target Link',
      render: (row) => (
        <a
          href={`/q/${row.token}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
        >
          <span>/q/{row.token}</span>
          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
        </a>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'primary' : 'default'}>
          {row.isActive ? 'Active' : 'Disabled'}
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
            onClick={() => onView(row)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Preview & Print QR Code"
          >
            <QrCodeIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus(row)}
            className={`p-1.5 rounded-lg border transition ${
              row.isActive
                ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10 dark:hover:bg-amber-500/10'
                : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title={row.isActive ? 'Disable QR code' : 'Activate QR code'}
          >
            {row.isActive ? <NoSymbolIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => onDelete(row)}
            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Delete QR code"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];
}
