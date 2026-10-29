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
      color: 'from-amber-600 to-amber-700',
    },
    {
      name: 'Active Menus',
      value: stats?.totalMenus,
      icon: DocumentTextIcon,
      link: '/menus',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      name: 'QR Codes Studio',
      value: stats?.totalQRCodes,
      icon: QrCodeIcon,
      link: '/qr-codes',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      name: 'Categories',
      value: stats?.totalCategories,
      icon: TagIcon,
      link: '/catalog?tab=categories',
      color: 'from-amber-500 to-orange-600',
    },
    {
      name: 'Branches Count',
      value: `${stats?.totalBranches ?? 0} / ${stats?.maxBranches ?? 3}`,
      icon: BuildingOffice2Icon,
      link: '/branches',
      color: 'from-purple-500 to-pink-600',
    },
    {
      name: 'Featured Promo Sections',
      value: stats?.totalFeatured,
      icon: FireIcon,
      link: '/featured',
      color: 'from-rose-500 to-red-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Artisan Luminous Frosted Glass Hero Banner */}
      <div className="relative overflow-hidden p-8 md:p-9 rounded-3xl bg-gradient-to-br from-stone-900/90 via-stone-900/70 to-stone-950/90 dark:from-stone-900/60 dark:via-stone-950/80 dark:to-[#0c0a09]/95 backdrop-blur-2xl border border-stone-800/80 dark:border-white/[0.08] shadow-2xl shadow-black/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group">
        {/* Ambient Warm Honey Backlight Halo */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none transform group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Active Branch: {activeBranch?.name || 'Main Branch'}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-3 tracking-tight text-white">
            Welcome to Restaurant Portal
          </h2>
          <p className="text-stone-300 dark:text-stone-400 text-sm mt-1.5 max-w-xl leading-relaxed">
            Manage your menus, product prices, featured recommendations, and export permanent QR codes for customer scanning.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Button
            as={Link}
            to="/qr-codes"
            variant="glass"
            size="md"
            rounded="full"
            className="flex items-center justify-center gap-2 font-bold text-sm shadow-sm hover:border-amber-400/40"
          >
            <QrCodeIcon className="w-5 h-5 text-amber-300" />
            <span>Generate QR</span>
          </Button>
          <Button
            as={Link}
            to="/menus?create=true"
            variant="primary"
            size="md"
            rounded="full"
            className="flex items-center justify-center gap-2 py-2.5 px-5 font-bold text-sm shadow-none transition active:scale-95"
          >
            <PlusIcon className="w-5 h-5 stroke-[2.5]" />
            <span>Create Menu</span>
          </Button>
        </div>
      </div>

      {/* Frosted Glass KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : cards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Link
                  key={idx}
                  to={card.link}
                  className="group relative overflow-hidden p-6 rounded-3xl bg-white/75 dark:bg-stone-900/40 hover:dark:bg-stone-900/65 backdrop-blur-xl border border-stone-200/80 dark:border-white/[0.07] hover:border-amber-500/40 shadow-lg shadow-black/5 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {/* Micro ambient backlight on hover */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/0 group-hover:bg-amber-500/10 rounded-full blur-2xl transition-all duration-500 pointer-events-none" />

                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {card.name}
                      </p>
                      <p className="text-3xl font-extrabold mt-2 text-stone-900 dark:text-stone-100 tracking-tight">
                        {card.value ?? 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/[0.12] border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-stone-950 group-hover:shadow-amber-500/40 transition-all duration-300">
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
