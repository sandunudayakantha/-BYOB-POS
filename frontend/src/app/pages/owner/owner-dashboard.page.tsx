import React from 'react';
import { useBranch } from '@/contexts/BranchContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { CardSkeleton } from '@/components/Skeleton';
import { Link } from 'react-router-dom';
import { Button } from '@/atomic/atm.button';
import {
  ShoppingBagIcon,
  DocumentTextIcon,
  QrCodeIcon,
  TagIcon,
  BuildingOffice2Icon,
  FireIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

export const OwnerDashboardPage: React.FC = () => {
  const { activeBranch } = useBranch();
  const branchId = activeBranch?._id || activeBranch?.id;

  const { data: stats, isLoading } = useQuery({
    queryKey: ['ownerDashboardStats', branchId],
    queryFn: async () => {
      const res = await api.get('/owner/dashboard-stats', {
        params: { branchId },
      });
      return res.data;
    },
    enabled: Boolean(branchId),
  });

  const cards = [
    {
      name: 'Products Catalog',
      value: stats?.totalProducts,
      icon: ShoppingBagIcon,
      link: '/catalog?tab=products',
    },
    {
      name: 'Active Menus',
      value: stats?.totalMenus,
      icon: DocumentTextIcon,
      link: '/menus',
    },
    {
      name: 'QR Codes Studio',
      value: stats?.totalQRCodes,
      icon: QrCodeIcon,
      link: '/qr-codes',
    },
    {
      name: 'Categories',
      value: stats?.totalCategories,
      icon: TagIcon,
      link: '/catalog?tab=categories',
    },
    {
      name: 'Branches Count',
      value: `${stats?.totalBranches ?? 0} / ${stats?.maxBranches ?? 3}`,
      icon: BuildingOffice2Icon,
      link: '/branches',
    },
    {
      name: 'Featured Promo Sections',
      value: stats?.totalFeatured,
      icon: FireIcon,
      link: '/featured',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 md:p-9 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Branch: {activeBranch?.name || 'Main Branch'}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-3 tracking-tight text-slate-900">
            Welcome to Restaurant Portal
          </h2>
          <p className="text-slate-600 text-sm mt-1.5 max-w-xl leading-relaxed">
            Manage your menus, product prices, featured recommendations, and export permanent QR codes for customer scanning.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            as={Link}
            to="/qr-codes"
            variant="secondary"
            size="md"
            rounded="full"
            className="flex items-center justify-center gap-2 font-semibold text-sm shadow-sm"
          >
            <QrCodeIcon className="w-5 h-5 text-emerald-600" />
            <span>Generate QR</span>
          </Button>
          <Button
            as={Link}
            to="/menus?create=true"
            variant="primary"
            size="md"
            rounded="full"
            className="flex items-center justify-center gap-2 py-2.5 px-5 font-semibold text-sm shadow-sm transition active:scale-95"
          >
            <PlusIcon className="w-5 h-5 stroke-[2.5]" />
            <span>Create Menu</span>
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : cards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Link
                  key={idx}
                  to={card.link}
                  className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-600 transition-colors">
                        {card.name}
                      </p>
                      <p className="text-3xl font-extrabold mt-2 text-slate-900 tracking-tight">
                        {card.value ?? 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
                      <Icon className="w-6 h-6 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>
    </div>
  );
};

export default OwnerDashboardPage;
