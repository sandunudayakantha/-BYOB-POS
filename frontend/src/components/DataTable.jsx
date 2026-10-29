import React, { useState } from 'react';
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { TableSkeleton } from './Skeleton';

const DataTable = ({
  columns,
  data = [],
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  onSearch,
  pagination = true,
  pageSize = 10,
  actionButton = null,
  serverPagination = false,
  page = 1,
  totalPages = 1,
  total = 0,
  onPageChange,
  onRowClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localPage, setLocalPage] = useState(1);

  const currentPage = serverPagination ? page : localPage;

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
    if (!serverPagination) setLocalPage(1);
  };

  const handlePageChange = (newPage) => {
    if (serverPagination) {
      if (onPageChange) onPageChange(newPage);
    } else {
      setLocalPage(newPage);
    }
  };

  const filteredData = (searchable && !onSearch && !serverPagination)
    ? data.filter((item) =>
        Object.values(item).some(
          (val) => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  const calculatedTotalPages = serverPagination ? totalPages : (Math.ceil(filteredData.length / pageSize) || 1);
  const totalRecords = serverPagination ? total : filteredData.length;

  const displayData = (pagination && !serverPagination)
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData;

  return (
    <div className="bg-white/75 dark:bg-stone-900/40 rounded-3xl border border-stone-200/80 dark:border-white/[0.07] backdrop-blur-xl shadow-xl shadow-black/15 overflow-hidden">
      {/* Search & Action Header */}
      {(searchable || actionButton) && (
        <div className="p-4 border-b border-stone-100 dark:border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
          {searchable ? (
            <div className="relative w-full sm:w-auto sm:max-w-xs flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          ) : <div />}
          {actionButton && <div>{actionButton}</div>}
        </div>
      )}

      {/* Table Body */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={columns.length} />
          </div>
        ) : displayData.length === 0 ? (
          <div className="p-12 text-center text-stone-500 dark:text-stone-400">
            No records found.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-stone-700 dark:text-stone-200">
            <thead>
              <tr className="bg-stone-100/80 dark:bg-stone-950/80 border-b border-stone-200/80 dark:border-white/[0.06] text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {columns.map((col, idx) => (
                  <th key={idx} className="px-6 py-3.5">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/[0.05] text-sm">
              {displayData.map((row, rIdx) => (
                <tr
                  key={row._id || rIdx}
                  onClick={() => onRowClick?.(row)}
                  className={`hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-colors duration-150 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-6 py-4">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Pagination */}
      {pagination && displayData.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Page {currentPage} of {calculatedTotalPages}
            </span>
            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, calculatedTotalPages))}
              disabled={currentPage >= calculatedTotalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
