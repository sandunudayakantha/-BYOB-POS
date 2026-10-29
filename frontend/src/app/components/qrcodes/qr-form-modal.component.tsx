import React, { useMemo } from 'react';
import Modal from '@/components/Modal';
import { FormInput, FormSelect } from '@/components/FormFields';
import { Button } from '@/atomic/atm.button';

export interface QRFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  menus: any[];
  formData: {
    menuId: string;
    tableName: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const QRFormModal: React.FC<QRFormModalProps> = ({
  isOpen,
  onClose,
  menus,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
}) => {
  const availableMenus = useMemo(() => {
    return (menus || []).filter((m) => m.status !== 'INACTIVE');
  }, [menus]);

  const menuOptions = useMemo(() => {
    if (availableMenus.length === 0) {
      return [{ value: '', label: 'No active menus available' }];
    }
    return availableMenus.map((m) => ({
      value: String(m.id || m._id),
      label: `${m.name}${m.isBaseMenu ? ' (Base Menu)' : ''}`,
    }));
  }, [availableMenus]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Permanent QR Code">
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-xs text-slate-500">
          Generate high-resolution printable QR codes linking guests to their digital live menu.
        </p>
        <FormSelect
          label="Assigned Branch Menu"
          value={formData.menuId}
          onChange={(e: any) => setFormData({ ...formData, menuId: e.target.value })}
          options={menuOptions}
          disabled={availableMenus.length === 0}
        />
        {availableMenus.length === 0 && (
          <p className="text-xs text-rose-500">
            Please create an active menu in Menus before generating QR codes.
          </p>
        )}
        <FormInput
          label="Table Identifier (Optional)"
          placeholder="e.g. Table 04, VIP Patio, Bar Stool 2"
          value={formData.tableName}
          onChange={(e: any) => setFormData({ ...formData, tableName: e.target.value })}
        />
        <Button
          type="submit"
          variant="primary"
          rounded="full"
          disabled={isSubmitting || availableMenus.length === 0 || !formData.menuId}
          isLoading={isSubmitting}
          className="w-full py-3 font-bold text-sm shadow-none"
        >
          Generate QR Code
        </Button>
      </form>
    </Modal>
  );
};
