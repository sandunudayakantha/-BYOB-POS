import React, { type ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = "No records found.",
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center space-y-3 bg-white/70 dark:bg-stone-900/40 backdrop-blur-xl rounded-3xl border border-stone-200/80 dark:border-white/[0.07] shadow-xl shadow-black/10">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full py-16 text-center text-sm text-stone-500 dark:text-stone-400 border border-dashed border-stone-200 dark:border-white/[0.08] rounded-3xl bg-stone-50/50 dark:bg-stone-900/20">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-stone-200/80 dark:border-white/[0.07] bg-white/75 dark:bg-stone-900/40 backdrop-blur-xl shadow-xl shadow-black/15">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-stone-700 dark:text-stone-200">
          <thead className="bg-stone-100/80 dark:bg-stone-950/80 text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 border-b border-stone-200/80 dark:border-white/[0.06]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-4 font-bold text-stone-600 dark:text-stone-300 select-none ${
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-white/[0.05]">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-colors duration-150 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-5 py-4 ${
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                    }`}
                  >
                    {col.render ? col.render(row) : (row as Record<string, any>)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
