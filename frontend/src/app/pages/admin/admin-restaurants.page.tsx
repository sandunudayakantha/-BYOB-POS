import React, { useState, useMemo } from 'react';
import { useRestaurantsUseCase } from '@/app/domain/restaurants/use-restaurants.use-case';
import { useCreateRestaurantUseCase } from '@/app/domain/restaurants/use-create-restaurant.use-case';
import { useUpdateRestaurantStatusUseCase } from '@/app/domain/restaurants/use-update-restaurant-status.use-case';
import { useUpdateBranchLimitUseCase } from '@/app/domain/restaurants/use-update-branch-limit.use-case';
import { useResetRestaurantPasswordUseCase } from '@/app/domain/restaurants/use-reset-restaurant-password.use-case';
import { useDeleteRestaurantUseCase } from '@/app/domain/restaurants/use-delete-restaurant.use-case';
import { buildRestaurantColumns } from '@/app/components/restaurants/restaurant-table-columns';
import { DataTable } from '@/atomic/obj.data-table';
import Modal from '@/components/Modal';
import { FormInput } from '@/components/FormFields';
import toast from 'react-hot-toast';
import type { RestaurantModel } from '@/app/models/restaurant.model';
import { PlusIcon } from '@heroicons/react/24/outline';

export const AdminRestaurantsPage: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [selectedRest, setSelectedRest] = useState<RestaurantModel | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    maxBranches: 3,
  });

  const [newPassword, setNewPassword] = useState('');
  const [newMaxBranches, setNewMaxBranches] = useState(3);

  const { restaurants, isLoading } = useRestaurantsUseCase();
  const { createRestaurant, isSubmitting: isCreating } = useCreateRestaurantUseCase();
  const { updateStatus } = useUpdateRestaurantStatusUseCase();
  const { updateBranchLimit, isSubmitting: isUpdatingLimit } = useUpdateBranchLimitUseCase();
  const { resetPassword, isSubmitting: isResetting } = useResetRestaurantPasswordUseCase();
  const { deleteRestaurant } = useDeleteRestaurantUseCase();

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRestaurant(formData);
      toast.success('Restaurant and Owner account created successfully!');
      setCreateModalOpen(false);
      setFormData({ name: '', ownerName: '', ownerEmail: '', ownerPassword: '', maxBranches: 3 });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create restaurant.');
    }
  };

  const handleToggleStatus = async (rest: RestaurantModel) => {
    const nextStatus = rest.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateStatus({ restaurantId: rest.id, status: nextStatus });
      toast.success('Status updated successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status.');
    }
  };

  const handleLimitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRest) return;
    try {
      await updateBranchLimit({ restaurantId: selectedRest.id, maxBranches: newMaxBranches });
      toast.success('Branch limit updated!');
      setLimitModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update branch limit.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRest) return;
    try {
      await resetPassword({ restaurantId: selectedRest.id, newPassword });
      toast.success('Password reset successfully!');
      setResetModalOpen(false);
      setNewPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reset password.');
    }
  };

  const handleDelete = async (rest: RestaurantModel) => {
    if (!window.confirm(`Delete ${rest.name}? This removes all branches and products permanently.`)) return;
    try {
      await deleteRestaurant({ restaurantId: rest.id });
      toast.success('Restaurant deleted successfully.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete restaurant.');
    }
  };

  const columns = useMemo(() => {
    return buildRestaurantColumns({
      onOpenResetPass: (r) => {
        setSelectedRest(r);
        setNewPassword('');
        setResetModalOpen(true);
      },
      onOpenLimitModal: (r) => {
        setSelectedRest(r);
        setNewMaxBranches(r.maxBranches || 3);
        setLimitModalOpen(true);
      },
      onToggleStatus: handleToggleStatus,
      onDelete: handleDelete,
    });
  }, [restaurants]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Tenants & Restaurants Management
          </h2>
          <p className="text-sm text-slate-500">
            Provision restaurant organizations, assign owner credentials, and manage branch limits.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Onboard Restaurant</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={restaurants}
        keyExtractor={(item) => String(item.id)}
        isLoading={isLoading}
        emptyMessage="No restaurants registered yet."
      />

      {/* Modal: Onboard Restaurant */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Onboard New Restaurant Tenant">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormInput
            label="Restaurant Brand Name"
            placeholder="e.g. Bella Italia Bistro"
            value={formData.name}
            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Owner Full Name"
              placeholder="e.g. Mario Rossi"
              value={formData.ownerName}
              onChange={(e: any) => setFormData({ ...formData, ownerName: e.target.value })}
              required
            />
            <FormInput
              label="Owner Email Address"
              type="email"
              placeholder="e.g. mario@bistro.com"
              value={formData.ownerEmail}
              onChange={(e: any) => setFormData({ ...formData, ownerEmail: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Initial Password"
              type="password"
              placeholder="Min 6 characters"
              value={formData.ownerPassword}
              onChange={(e: any) => setFormData({ ...formData, ownerPassword: e.target.value })}
              required
            />
            <FormInput
              label="Max Allowed Branches"
              type="number"
              value={formData.maxBranches}
              onChange={(e: any) => setFormData({ ...formData, maxBranches: Number(e.target.value) })}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {isCreating ? 'Provisioning...' : 'Provision Restaurant'}
          </button>
        </form>
      </Modal>

      {/* Modal: Adjust Quota */}
      <Modal isOpen={limitModalOpen} onClose={() => setLimitModalOpen(false)} title={`Set Max Branches: ${selectedRest?.name || ''}`}>
        <form onSubmit={handleLimitSubmit} className="space-y-4">
          <FormInput
            label="Branch Creation Quota"
            type="number"
            value={newMaxBranches}
            onChange={(e: any) => setNewMaxBranches(Number(e.target.value))}
            required
          />
          <button
            type="submit"
            disabled={isUpdatingLimit}
            className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {isUpdatingLimit ? 'Saving...' : 'Update Quota'}
          </button>
        </form>
      </Modal>

      {/* Modal: Reset Password */}
      <Modal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} title={`Reset Password: ${selectedRest?.name || ''}`}>
        <form onSubmit={handleResetSubmit} className="space-y-4">
          <FormInput
            label="New Temporary Password"
            type="password"
            placeholder="Min 6 characters"
            value={newPassword}
            onChange={(e: any) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={isResetting}
            className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {isResetting ? 'Resetting...' : 'Set New Password'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminRestaurantsPage;
