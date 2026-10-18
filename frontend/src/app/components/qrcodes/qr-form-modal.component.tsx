import React from 'react';
import Modal from '@/components/Modal';
import { FormInput, FormSelect } from '@/components/FormFields';

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
          options={[
            { value: '', label: 'Default Live Menu' },
            ...menus.map((m) => ({ value: m.id || m._id, label: `${m.name} ${m.isBaseMenu ? '(Base)' : ''}` })),
          ]}
        />
        <FormInput
          label="Table Identifier (Optional)"
          placeholder="e.g. Table 04, VIP Patio, Bar Stool 2"
          value={formData.tableName}
          onChange={(e: any) => setFormData({ ...formData, tableName: e.target.value })}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Generating...' : 'Generate QR Code'}
        </button>
      </form>
    </Modal>
  );
};
