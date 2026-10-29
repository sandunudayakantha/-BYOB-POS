import React, { useEffect } from 'react';
import { XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import type { KitchenPrepBatchModel } from '@/app/models/inventory.model';
import { sanitizeUrl } from '@/utils/url';

export interface EvidenceLightboxModalProps {
  isOpen: boolean;
  batch: KitchenPrepBatchModel | null;
  type?: 'wastage' | 'prep';
  onClose: () => void;
}

export const EvidenceLightboxModal: React.FC<EvidenceLightboxModalProps> = ({
  isOpen,
  batch,
  type = 'wastage',
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !batch) return null;

  const imageUrl = type === 'wastage' ? (batch.wastageImageUrl || batch.prepImageUrl) : (batch.prepImageUrl || batch.wastageImageUrl);
  const isWastage = type === 'wastage' || Boolean(batch.wastageImageUrl && !batch.prepImageUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isWastage
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isWastage ? 'Wastage & Trimmings Proof' : 'Preparation Output Proof'}
            </span>
            <span className="text-sm font-semibold text-stone-200">
              {batch.prepDefinitionName || 'Batch Evidence'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {imageUrl && (
              <a
                href={sanitizeUrl(imageUrl)}
                target="_blank"
                rel="noopener noreferrer"
                title="Open original resolution in new tab"
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
              >
                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content: Photo & Inspection Details */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Main Photo */}
          <div className="md:col-span-2 bg-black flex items-center justify-center min-h-[320px] max-h-[560px] p-4">
            {imageUrl ? (
              <img
                src={sanitizeUrl(imageUrl)}
                alt="Evidence Proof"
                className="max-h-[500px] w-auto max-w-full rounded-xl object-contain shadow-md"
              />
            ) : (
              <div className="text-stone-500 text-sm italic">No image file attached for this batch</div>
            )}
          </div>

          {/* Metadata Inspector Sidebar */}
          <div className="p-6 bg-stone-900 border-t md:border-t-0 md:border-l border-stone-800 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Preparation Recipe
                </span>
                <p className="text-base font-extrabold text-white">
                  {batch.prepDefinitionName || 'Recipe Batch'}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  Prepared by <strong className="text-stone-200">{batch.preparedByName || 'Kitchen Staff'}</strong>
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-stone-800 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-400">Timestamp</span>
                  <span className="font-semibold text-stone-200">
                    {batch.createdAt
                      ? new Date(batch.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-400">Raw Input Used</span>
                  <span className="font-bold text-stone-200">
                    {Number(batch.rawInputQuantity).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-400">Actual Yield</span>
                  <span className="font-bold text-amber-400">
                    {Number(batch.actualYieldQuantity).toFixed(2)} {batch.outputUomSymbol || ''}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-400">Wastage / Scrap</span>
                  <span className="font-bold text-rose-400">
                    {Number(batch.wastageQuantity).toFixed(2)}
                    {batch.rawInputQuantity > 0 && (
                      <span className="text-[10px] font-normal text-stone-400 ml-1">
                        ({((batch.wastageQuantity / batch.rawInputQuantity) * 100).toFixed(1)}%)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {batch.wastageReason && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                  <span className="font-bold text-rose-400 block uppercase text-[10px] tracking-wider">
                    Reported Reason / Note
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    {batch.wastageReason}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
