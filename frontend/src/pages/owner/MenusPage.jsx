import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useBranch } from '../../contexts/BranchContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import PriceMatrixView from '../../components/PriceMatrixView';
import { FormInput, FormTextarea, FormSelect } from '../../components/FormFields';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  WrenchIcon,
  TableCellsIcon,
  QueueListIcon,
  CalculatorIcon,
  SparklesIcon,
  StarIcon as StarOutlineIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const MenusPage = () => {
  const queryClient = useQueryClient();
  const { activeBranch } = useBranch();
  const [activeTab, setActiveTab] = useState('MATRIX'); // 'LIST' | 'MATRIX'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);

  const [adjustModalMenu, setAdjustModalMenu] = useState(null);
  const [adjustPercentage, setAdjustPercentage] = useState('15');
  const [adjustSourceMode, setAdjustSourceMode] = useState('BASE_MENU'); // 'BASE_MENU' | 'CURRENT_MENU'

  const [fillModalMenu, setFillModalMenu] = useState(null);
  const [fillPercentage, setFillPercentage] = useState('15');
  const [fillOverwrite, setFillOverwrite] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    isBaseMenu: false
  });

  const { data: menus = [], isLoading } = useQuery({
    queryKey: ['ownerMenus', activeBranch?._id],
    queryFn: async () => {
      const res = await api.get('/menus', { params: { branchId: activeBranch?._id } });
      return res.data;
    },
    enabled: !!activeBranch
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingMenu) {
        return api.put(`/menus/${editingMenu._id}`, data);
      }
      return api.post('/menus', { ...data, branchId: activeBranch._id });
    },
    onSuccess: () => {
      toast.success(editingMenu ? 'Menu updated!' : 'Menu created!');
      queryClient.invalidateQueries(['ownerMenus', activeBranch?._id]);
      queryClient.invalidateQueries(['priceMatrix']);
      handleClose();
    },
    onError: (err) => toast.error(err.message || 'Failed to save menu.')
  });

  const setBaseMutation = useMutation({
    mutationFn: (id) => api.patch(`/menus/${id}/base`),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Set as Base Menu for this branch!');
      queryClient.invalidateQueries(['ownerMenus', activeBranch?._id]);
      queryClient.invalidateQueries(['priceMatrix']);
    },
    onError: (err) => toast.error(err.message || 'Failed to set as base menu.')
  });

  const adjustPriceMutation = useMutation({
    mutationFn: ({ menuId, percentage, sourceMode }) =>
      api.post(`/menus/${menuId}/adjust-prices`, { percentage, sourceMode }),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Menu prices adjusted!');
      queryClient.invalidateQueries(['ownerMenus', activeBranch?._id]);
      queryClient.invalidateQueries(['priceMatrix']);
      setAdjustModalMenu(null);
    },
    onError: (err) => toast.error(err.message || 'Failed to adjust menu prices.')
  });

  const fillMissingMutation = useMutation({
    mutationFn: ({ menuId, percentage, overwriteExisting }) =>
      api.post(`/menus/${menuId}/fill-missing`, { percentage, overwriteExisting }),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Populated menu items successfully!');
      queryClient.invalidateQueries(['ownerMenus', activeBranch?._id]);
      queryClient.invalidateQueries(['priceMatrix']);
      setFillModalMenu(null);
    },
    onError: (err) => toast.error(err.message || 'Failed to populate menu items.')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/menus/${id}`),
    onSuccess: () => {
      toast.success('Menu deleted.');
      queryClient.invalidateQueries(['ownerMenus', activeBranch?._id]);
      queryClient.invalidateQueries(['priceMatrix']);
    },
    onError: (err) => toast.error(err.message || 'Failed to delete menu.')
  });

  const handleOpen = (m = null) => {
    if (m) {
      setEditingMenu(m);
      setFormData({
        name: m.name,
        description: m.description || '',
        status: m.status,
        isBaseMenu: m.isBaseMenu || false
      });
    } else {
      setEditingMenu(null);
      setFormData({ name: '', description: '', status: 'ACTIVE', isBaseMenu: menus.length === 0 });
    }
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingMenu(null);
  };

  const columns = [
    {
      header: 'Menu Title',
      accessor: 'name',
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
      )
    },
    {
      header: 'Items Count',
      accessor: 'itemCount',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
          {row.itemCount || 0} Products
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {/* Base Menu Star Toggle Button */}
          <button
            onClick={() => setBaseMutation.mutate(row._id)}
            disabled={row.isBaseMenu || setBaseMutation.isPending}
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

          {/* Auto-Fill / Populate Button */}
          {!row.isBaseMenu && (
            <button
              onClick={() => {
                setFillModalMenu(row);
                setFillPercentage('15');
                setFillOverwrite(false);
              }}
              className="py-1.5 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1 hover:bg-emerald-100 transition"
              title="Populate Missing Items from Base Menu"
            >
              + Fill
            </button>
          )}

          {/* Percentage Price Adjustment Button */}
          <button
            onClick={() => {
              setAdjustModalMenu(row);
              setAdjustPercentage('15');
              setAdjustSourceMode('BASE_MENU');
            }}
            className="py-1.5 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1 hover:bg-indigo-100 transition"
            title="Adjust Prices by Percentage (%)"
          >
            <CalculatorIcon className="w-4 h-4" />
            % Adjust
          </button>

          <Link
            to={`/menus/${row._id}/builder`}
            className="py-1.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition"
          >
            <WrenchIcon className="w-4 h-4" />
            Menu Builder
          </Link>

          <button
            onClick={() => handleOpen(row)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <PencilIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (window.confirm(`Delete ${row.name}?`)) deleteMutation.mutate(row._id);
            }}
            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Segmented Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Digital Menus & Price Matrix ({activeBranch?.name})
          </h2>
          <p className="text-sm text-slate-500">
            Manage menus or compare product prices across all menus in a single matrix report view.
          </p>
        </div>

        {/* View Segmented Toggle */}
        <div className="p-1 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center gap-1 text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('LIST')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'LIST'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <QueueListIcon className="w-4 h-4" />
            Menus List
          </button>
          <button
            onClick={() => setActiveTab('MATRIX')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'MATRIX'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TableCellsIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Price Matrix Report
          </button>
        </div>
      </div>

      {/* Tab Body */}
      {activeTab === 'LIST' ? (
        <DataTable
          columns={columns}
          data={menus}
          loading={isLoading}
          searchPlaceholder="Search menus..."
          actionButton={
            <button
              onClick={() => handleOpen()}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition"
            >
              <PlusIcon className="w-4 h-4" />
              Create Menu
            </button>
          }
        />
      ) : (
        <PriceMatrixView branchId={activeBranch?._id} />
      )}

      {/* Create / Edit Menu Modal */}
      <Modal isOpen={modalOpen} onClose={handleClose} title={editingMenu ? 'Edit Menu' : 'Create New Menu'}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(formData);
          }}
          className="space-y-4"
        >
          <FormInput
            label="Menu Title"
            placeholder="e.g. VIP Lounge Menu, Weekend Breakfast"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <FormTextarea
            label="Description"
            placeholder="Brief overview of this menu..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {editingMenu ? (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBaseMenu}
                  onChange={(e) => setFormData({ ...formData, isBaseMenu: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="flex items-center gap-1.5">
                  <StarSolidIcon className="w-4 h-4 text-amber-500" />
                  Set as Base Menu for this Branch
                </span>
              </label>
              <p className="text-[11px] text-slate-400 mt-1 pl-7">
                Only one base menu exists per branch. Baseline pricing is derived from this menu.
              </p>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              <p>
                ★ <span className="font-semibold text-slate-700 dark:text-slate-300">Note:</span> New menus are created as standard menus. You can designate this menu as the branch Base Menu anytime using the star (★) action button.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition"
          >
            {saveMutation.isPending ? 'Saving...' : editingMenu ? 'Update Menu' : 'Create Menu'}
          </button>
        </form>
      </Modal>

      {/* Adjust Prices (%) Modal */}
      <Modal
        isOpen={!!adjustModalMenu}
        onClose={() => setAdjustModalMenu(null)}
        title={`Adjust Item Prices for "${adjustModalMenu?.name}"`}
      >
        {adjustModalMenu && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const targetMenuId = adjustModalMenu?._id || adjustModalMenu?.id;
              if (!targetMenuId) return;
              adjustPriceMutation.mutate({
                menuId: parseInt(targetMenuId, 10),
                percentage: Number(adjustPercentage),
                sourceMode: adjustSourceMode
              });
            }}
            className="space-y-4"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Batch recalculate prices for all products in <strong>"{adjustModalMenu.name}"</strong> using a percentage markup or discount.
            </p>

            <FormInput
              label="Percentage Adjustment (%)"
              type="number"
              step="0.1"
              placeholder="e.g. 15 for +15%, -10 for -10%"
              value={adjustPercentage}
              onChange={(e) => setAdjustPercentage(e.target.value)}
              required
            />

            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Calculation Baseline Source
              </label>

              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="sourceMode"
                    value="BASE_MENU"
                    checked={adjustSourceMode === 'BASE_MENU'}
                    onChange={() => setAdjustSourceMode('BASE_MENU')}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <span>Calculate relative to <strong>Base Menu</strong> prices (Recommended)</span>
                </label>

                <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="sourceMode"
                    value="CURRENT_MENU"
                    checked={adjustSourceMode === 'CURRENT_MENU'}
                    onChange={() => setAdjustSourceMode('CURRENT_MENU')}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <span>Calculate relative to <strong>Current Menu</strong> prices</span>
                </label>
              </div>
            </div>

            {/* Math Sample Preview Box */}
            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
              <span className="font-bold text-indigo-900 dark:text-indigo-300 block">Sample Price Math Preview:</span>
              <p className="text-slate-600 dark:text-slate-400">
                Baseline Item Price: <span className="font-bold text-slate-900 dark:text-white">100.00 LKR</span>
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Adjustment: <span className="font-bold text-emerald-600 dark:text-emerald-400">{Number(adjustPercentage) >= 0 ? `+${adjustPercentage}` : adjustPercentage}%</span>
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                New Calculated Price: <span className="font-black text-indigo-600 dark:text-indigo-400">{(100 * (1 + Number(adjustPercentage || 0) / 100)).toFixed(2)} LKR</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={adjustPriceMutation.isPending}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-md"
            >
              <CalculatorIcon className="w-4 h-4" />
              {adjustPriceMutation.isPending ? 'Calculating & Updating Prices...' : `Apply ${Number(adjustPercentage) >= 0 ? '+' : ''}${adjustPercentage}% Price Change`}
            </button>
          </form>
        )}
      </Modal>

      {/* Auto-Fill / Populate Menu Modal */}
      <Modal
        isOpen={!!fillModalMenu}
        onClose={() => setFillModalMenu(null)}
        title={`Auto-Fill / Sync Products into "${fillModalMenu?.name}"`}
      >
        {fillModalMenu && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const targetMenuId = fillModalMenu?._id || fillModalMenu?.id;
              if (!targetMenuId) return;
              fillMissingMutation.mutate({
                menuId: parseInt(targetMenuId, 10),
                percentage: Number(fillPercentage),
                overwriteExisting: fillOverwrite
              });
            }}
            className="space-y-4"
          >
            <FormSelect
              label="Select Target Menu to Populate"
              value={fillModalMenu._id || fillModalMenu.id}
              onChange={(e) => {
                const selected = menus.find((m) => String(m._id || m.id) === String(e.target.value));
                if (selected) setFillModalMenu(selected);
              }}
              options={menus.map((m) => ({
                value: m._id || m.id,
                label: `${m.name} ${m.isBaseMenu ? '(Base Menu ★)' : ''}`
              }))}
              required
            />

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Instantly populate missing catalog products from the <strong>Base Menu</strong> into <strong>"{fillModalMenu.name}"</strong> with an optional percentage markup.
            </p>

            <FormInput
              label="Percentage Markup on Base Price (%)"
              type="number"
              step="0.1"
              placeholder="e.g. 15 for +15% markup, 0 for same base price"
              value={fillPercentage}
              onChange={(e) => setFillPercentage(e.target.value)}
              required
            />

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fillOverwrite}
                  onChange={(e) => setFillOverwrite(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <span>Overwrite existing product prices in this menu</span>
              </label>
              <p className="text-[11px] text-slate-400 mt-1 pl-7">
                Leave unchecked to fill missing products only while preserving existing item prices.
              </p>
            </div>

            {/* Math Sample Preview Box */}
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 block">Auto-Fill Calculation Preview:</span>
              <p className="text-slate-600 dark:text-slate-400">
                Base Menu Item Price: <span className="font-bold text-slate-900 dark:text-white">1,000.00 LKR</span>
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Markup Applied: <span className="font-bold text-emerald-600 dark:text-emerald-400">+{fillPercentage}%</span>
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                New Target Menu Item Price: <span className="font-black text-emerald-600 dark:text-emerald-400">{(1000 * (1 + Number(fillPercentage || 0) / 100)).toFixed(2)} LKR</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={fillMissingMutation.isPending}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-md"
            >
              <SparklesIcon className="w-4 h-4" />
              {fillMissingMutation.isPending ? 'Populating Menu Products...' : `Populate "${fillModalMenu.name}" (+${fillPercentage}%)`}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default MenusPage;
