import React from 'react';
import { PhotoIcon, PlusIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface PriceMatrixTableProps {
  menus: any[];
  products: any[];
  matrix: Record<string, Record<string, any>>;
  baseMenu: any;
  matrixViewMode: 'COMBINED' | 'VARIANCE' | 'LKR';
  onCellClick: (cell: any) => void;
  onAdjustMenu: (menu: any) => void;
  onFillMenu: (menu: any) => void;
}

export const PriceMatrixTable: React.FC<PriceMatrixTableProps> = ({
  menus,
  products,
  matrix,
  baseMenu,
  matrixViewMode,
  onCellClick,
  onAdjustMenu,
  onFillMenu,
}) => {
  return (
    <div className="overflow-auto max-h-[580px] relative scrollbar-thin">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            <th className="px-6 py-4 sticky top-0 left-0 z-30 bg-slate-50/95 backdrop-blur-sm border-r border-b border-slate-200 min-w-[260px] shadow-sm">
              Product Details
            </th>
            {menus.map((m) => (
              <th
                key={m._id}
                className="px-6 py-3 text-center min-w-[170px] sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 shadow-sm"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-extrabold text-slate-900 text-sm block">
                    {m.name}
                  </span>
                  {m.isBaseMenu ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-700">
                      <StarSolidIcon className="w-2.5 h-2.5 text-emerald-600" />
                      Base Menu
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 mt-0.5">
                      <button
                        onClick={() => onAdjustMenu(m)}
                        className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 hover:text-emerald-700 hover:bg-slate-200 border border-slate-200 text-[10px] font-bold flex items-center gap-1 transition"
                        title={`Adjust prices for ${m.name} by percentage (%)`}
                      >
                        <span>% Adjust</span>
                      </button>

                      <button
                        onClick={() => onFillMenu(m)}
                        className="px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold transition"
                        title={`Populate missing products into ${m.name}`}
                      >
                        <span>+ Fill</span>
                      </button>
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {products.map((prod) => {
            const pId = prod._id || prod.id;
            const prices = menus.map((m) => {
              const mId = m._id || m.id;
              return matrix[pId]?.[mId]?.price;
            }).filter((p) => p !== undefined);
            const hasVariance = new Set(prices).size > 1;

            return (
              <tr key={pId} className="hover:bg-slate-50/70 transition">
                <td className="px-6 py-4 sticky left-0 z-10 bg-white border-r border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    {prod.image ? (
                      <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                        <PhotoIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{prod.name}</span>
                        {hasVariance && (
                          <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Price Variant
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{prod.category?.name || 'General'}</span>
                        <span>•</span>
                        <span>{prod.prepTime || '15 mins'}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {menus.map((menu) => {
                  const mId = menu._id || menu.id;
                  const cellData = matrix[pId]?.[mId];
                  const price = cellData?.price;
                  const isIncluded = price !== undefined;

                  const baseMId = baseMenu ? (baseMenu._id || baseMenu.id) : null;
                  const basePrice = baseMId ? matrix[pId]?.[baseMId]?.price : undefined;
                  let varPct = null;
                  if (isIncluded && basePrice !== undefined && basePrice > 0 && !menu.isBaseMenu) {
                    varPct = ((price - basePrice) / basePrice) * 100;
                  }

                  return (
                    <td key={menu._id} className="px-6 py-4 text-center">
                      {isIncluded ? (
                        <button
                          onClick={() =>
                            onCellClick({
                              productId: prod.id || prod._id,
                              productName: prod.name,
                              menuId: menu.id || menu._id,
                              menuName: menu.name,
                              menuItemId: cellData.menuItemId,
                              currentPrice: price,
                            })
                          }
                          className={`group inline-flex flex-col items-center justify-center p-2.5 rounded-xl border transition w-full ${
                            matrixViewMode === 'VARIANCE'
                              ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                              : 'border-emerald-200/80 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-300'
                          }`}
                        >
                          {matrixViewMode === 'VARIANCE' ? (
                            <>
                              {menu.isBaseMenu ? (
                                <span className="font-extrabold text-emerald-700 text-sm">
                                  0.0% (Base)
                                </span>
                              ) : varPct !== null ? (
                                <span
                                  className={`font-black text-sm ${
                                    varPct > 0
                                      ? 'text-emerald-700'
                                      : varPct < 0
                                      ? 'text-rose-600'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {varPct > 0 ? `+${varPct.toFixed(1)}%` : `${varPct.toFixed(1)}%`}
                                </span>
                              ) : (
                                <span className="font-extrabold text-slate-400 text-xs">N/A</span>
                              )}
                              <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                LKR {price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="font-extrabold text-slate-900 text-sm">
                                LKR {price.toFixed(2)}
                              </span>
                              {menu.isBaseMenu ? (
                                <span className="text-[9px] font-black uppercase text-emerald-700 mt-0.5">
                                  Base Price
                                </span>
                              ) : varPct !== null && matrixViewMode !== 'LKR' ? (
                                <span
                                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full mt-0.5 inline-flex items-center gap-0.5 ${
                                    varPct > 0
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : varPct < 0
                                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {varPct > 0 ? `+${varPct.toFixed(1)}%` : `${varPct.toFixed(1)}%`}
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-700 font-semibold group-hover:underline flex items-center gap-1 mt-0.5">
                                  <PencilSquareIcon className="w-3 h-3" /> Edit Price
                                </span>
                              )}
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onCellClick({
                              productId: prod.id || prod._id,
                              productName: prod.name,
                              menuId: menu.id || menu._id,
                              menuName: menu.name,
                              menuItemId: null,
                              currentPrice: '',
                            });
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/40 text-xs font-semibold transition w-full"
                        >
                          <PlusIcon className="w-3.5 h-3.5" />
                          Add to Menu
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
