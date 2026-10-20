import React, { useState, useMemo } from 'react';
import { useBranch } from '@/contexts/BranchContext';
import { useQRCodesUseCase } from '@/app/domain/qrcodes/use-qrcodes.use-case';
import { useCreateQRCodeUseCase } from '@/app/domain/qrcodes/use-create-qrcode.use-case';
import { useToggleQRStatusUseCase } from '@/app/domain/qrcodes/use-toggle-qr-status.use-case';
import { useDeleteQRCodeUseCase } from '@/app/domain/qrcodes/use-delete-qrcode.use-case';
import { useMenusUseCase } from '@/app/domain/menus/use-menus.use-case';
import { buildQRColumns } from '@/app/components/qrcodes/qr-table-columns';
import { QRFormModal } from '@/app/components/qrcodes/qr-form-modal.component';
import QRModal from '@/components/QRModal';
import { DataTable } from '@/atomic/obj.data-table';
import toast from 'react-hot-toast';
import type { QRCodeModel } from '@/app/models/qrcode.model';
import { PlusIcon } from '@heroicons/react/24/outline';

export const QRCodesPage: React.FC = () => {
  const { activeBranch } = useBranch();
  const branchId = String(activeBranch?._id || activeBranch?.id || '');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewQR, setViewQR] = useState<QRCodeModel | null>(null);

  const [formData, setFormData] = useState({
    menuId: '',
    tableName: '',
  });

  const { qrCodes, isLoading } = useQRCodesUseCase({ branchId });
  const { menus } = useMenusUseCase({ branchId });

  const { createQRCode, isSubmitting: isCreating } = useCreateQRCodeUseCase();
  const { toggleStatus } = useToggleQRStatusUseCase();
  const { deleteQRCode } = useDeleteQRCodeUseCase();

  const handleOpenCreate = () => {
    const active = (menus || []).filter((m: any) => m.status !== 'INACTIVE');
    const baseMenu = active.find((m: any) => m.isBaseMenu) || active[0];
    setFormData({
      menuId: baseMenu ? String(baseMenu.id || baseMenu._id) : '',
      tableName: '',
    });
    setCreateModalOpen(true);
  };

  React.useEffect(() => {
    if (createModalOpen && !formData.menuId && menus && menus.length > 0) {
      const active = menus.filter((m: any) => m.status !== 'INACTIVE');
      const baseMenu = active.find((m: any) => m.isBaseMenu) || active[0];
      if (baseMenu) {
        setFormData((prev) => ({ ...prev, menuId: String(baseMenu.id || baseMenu._id) }));
      }
    }
  }, [createModalOpen, menus, formData.menuId]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.menuId) {
      toast.error('Please select an active menu for this QR code.');
      return;
    }
    try {
      await createQRCode({
        branchId,
        menuId: formData.menuId,
        tableName: formData.tableName || undefined,
      });
      toast.success('Permanent QR Code generated!');
      setCreateModalOpen(false);
      setFormData({ menuId: '', tableName: '' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate QR code.');
    }
  };

  const handleToggleStatus = async (qr: QRCodeModel) => {
    try {
      await toggleStatus({
        qrId: qr.id,
        isActive: !qr.isActive,
      });
      toast.success('QR Code status updated!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update QR status.');
    }
  };

  const handleDelete = async (qr: QRCodeModel) => {
    if (!window.confirm('Delete this QR code?')) return;
    try {
      await deleteQRCode({ qrId: qr.id });
      toast.success('QR Code deleted.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete QR code.');
    }
  };

  const columns = useMemo(() => {
    return buildQRColumns({
      menus,
      onView: (qr) => setViewQR(qr),
      onToggleStatus: handleToggleStatus,
      onDelete: handleDelete,
    });
  }, [qrCodes, menus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Table & Standing QR Codes
          </h2>
          <p className="text-sm text-slate-500">
            Generate permanent QR codes mapping directly to your digital restaurant live menu.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New QR Code</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={qrCodes}
        keyExtractor={(item) => String(item.id)}
        isLoading={isLoading}
        emptyMessage="No QR codes generated yet for this branch."
      />

      <QRFormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        menus={menus}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateSubmit}
        isSubmitting={isCreating}
      />

      {viewQR && (
        <QRModal
          isOpen={Boolean(viewQR)}
          onClose={() => setViewQR(null)}
          qrCode={viewQR}
          qrData={viewQR}
          logoUrl={activeBranch?.logo}
          brandName={activeBranch?.name}
        />
      )}
    </div>
  );
};

export default QRCodesPage;
