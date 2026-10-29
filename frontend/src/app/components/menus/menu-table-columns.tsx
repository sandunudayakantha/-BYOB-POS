import React from 'react';
import { type Column } from '@/atomic/obj.data-table';
import { Badge } from '@/atomic/atm.badge';
import type { MenuModel } from '@/app/models/menu.model';
import { Link } from 'react-router-dom';
import {
  TrashIcon,
  PencilIcon,
  WrenchIcon,
  CalculatorIcon,
  StarIcon as StarOutlineIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

export interface MenuTableColumnsProps {
  onToggleBase: (menu: MenuModel) => void;
  onOpenFill: (menu: MenuModel) => void;
  onOpenAdjust: (menu: MenuModel) => void;
  onEdit: (menu: MenuModel) => void;
  onDelete: (menu: MenuModel) => void;
  isSettingBase: boolean;
}

export function buildMenuColumns({
  onToggleBase,
  onOpenFill,
  onOpenAdjust,
  onEdit,
  onDelete,
  isSettingBase,
}: MenuTableColumnsProps): Column<MenuModel>[] {
  return [
    {
      key: 'name',
      header: 'Menu Title',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{row.name}</span>
            {row.isBaseMenu && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                <StarSolidIcon className="w-3 h-3 text-amber-500" />
                Base Menu
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400">{row.description || 'No description'}</div>
        </div>
      ),
    },
    {
      key: 'itemCount',
      header: 'Items Count',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
          {row.itemCount || 0} Products
        </span>
      ),
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
            onClick={() => onToggleBase(row)}
            disabled={row.isBaseMenu || isSettingBase}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
              row.isBaseMenu
                ? 'border-amber-400/50 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 cursor-default'
                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500 hover:border-amber-300 dark:hover:border-amber-700'
            }`}
            title={row.isBaseMenu ? 'Currently Base Menu' : 'Set as Base Menu'}
          >
            {row.isBaseMenu ? (
              <StarSolidIcon className="w-4 h-4 text-amber-500" />
            ) : (
              <StarOutlineIcon className="w-4 h-4" />
            )}
          </button>

          {!row.isBaseMenu && (
            <button
              type="button"
              onClick={() => onOpenFill(row)}
              className="py-1.5 px-2.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1 hover:bg-amber-500/20 border border-amber-500/20 transition"
              title="Populate Missing Items from Base Menu"
            >
              + Fill
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenAdjust(row)}
            className="py-1.5 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1 hover:bg-indigo-100 transition"
            title="Adjust Prices by Percentage (%)"
          >
            <CalculatorIcon className="w-4 h-4" />
            % Adjust
          </button>

          <Link
            to={`/menus/${row.id}/builder`}
            className="py-1.5 px-3 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-500 font-bold text-xs flex items-center gap-1.5 border border-stone-200 dark:border-stone-700 hover:border-amber-500/30 transition"
          >
            <WrenchIcon className="w-4 h-4" />
            Menu Builder
          </Link>

          <button
            type="button"
            onClick={() => onEdit(row)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <PencilIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(row)}
            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];
}
