import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBranch } from '../contexts/BranchContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Squares2X2Icon,
  BuildingOffice2Icon,
  TagIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  FireIcon,
  QrCodeIcon,
  UserCircleIcon,
  ArchiveBoxIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const OwnerLayout = () => {
  const { user, logout } = useAuth();
  const { branches, activeBranch, switchBranch } = useBranch();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const branchDropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
        setBranchDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setBranchDropdownOpen(false);
      }
    };

    if (branchDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [branchDropdownOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navSections = [
    {
      title: 'Operations',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: Squares2X2Icon },
        { name: 'Branches', path: '/branches', icon: BuildingOffice2Icon },
        { name: 'Product Catalog', path: '/catalog', icon: ShoppingBagIcon },
        { name: 'Inventory & Kitchen', path: '/inventory', icon: ArchiveBoxIcon },
      ]
    },
    {
      title: 'QR Menu Suite',
      badge: 'Digital Menu',
      items: [
        { name: 'Menus', path: '/menus', icon: DocumentTextIcon },
        { name: 'Featured Sections', path: '/featured', icon: FireIcon },
        { name: 'QR Codes Studio', path: '/qr-codes', icon: QrCodeIcon },
      ]
    },
    {
      title: 'Account',
      items: [
        { name: 'My Profile', path: '/profile', icon: UserCircleIcon }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex bg-stone-50 dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-[#0c0a09]/85 backdrop-blur-2xl border-r border-stone-200/70 dark:border-stone-800/50 flex flex-col justify-between transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto">
          {/* Logo Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-stone-100 dark:border-stone-800/50 sticky top-0 bg-white/80 dark:bg-[#0c0a09]/80 backdrop-blur-xl z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 font-black text-base shadow-lg shadow-amber-500/25">
                QR
              </div>
              <span className="font-extrabold text-base tracking-tight truncate text-stone-900 dark:text-white">
                {user?.restaurant?.name || 'Restaurant Portal'}
              </span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links Grouped by Section */}
          <nav className="p-4 space-y-5">
            {navSections.map((section, idx) => (
              <div key={section.title || idx} className="space-y-1">
                <div className="flex items-center justify-between px-3 pb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                    {section.title}
                  </span>
                  {section.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/60">
                      {section.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                            isActive
                              ? 'bg-amber-500/10 dark:bg-amber-500/[0.12] text-amber-600 dark:text-amber-400 font-semibold shadow-sm border border-amber-500/20'
                              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100/80 dark:hover:bg-stone-900/60 hover:text-stone-900 dark:hover:text-stone-100'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800/50 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-stone-100/50 dark:bg-stone-900/40 border border-transparent dark:border-white/[0.04]">
            <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || 'O'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-stone-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-stone-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-stone-200 dark:border-stone-800 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-95"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-6 bg-white/75 dark:bg-[#0c0a09]/75 backdrop-blur-2xl border-b border-stone-200/70 dark:border-stone-800/50 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Branch Context Dropdown */}
            {branches.length > 0 && (
              <div ref={branchDropdownRef} className="relative">
                <button
                  onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200/80 dark:border-stone-800/80 bg-white/60 dark:bg-stone-900/50 backdrop-blur-md text-xs font-semibold text-stone-800 dark:text-stone-200 hover:border-amber-500/40 hover:bg-stone-50 dark:hover:bg-stone-900 transition shadow-sm active:scale-95"
                >
                  <BuildingOffice2Icon className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="leading-none">{activeBranch ? activeBranch.name : 'Select Branch'}</span>
                  <ChevronDownIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                </button>

                {branchDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 py-1.5 z-40">
                    <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Select Active Location
                    </div>
                    {branches.map((b) => (
                      <button
                        key={b._id}
                        onClick={() => {
                          switchBranch(b);
                          setBranchDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/70 ${
                          activeBranch?._id === b._id ? 'font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10' : 'text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <span className="truncate">{b.name}</span>
                        {b.isMain && <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">Main</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full border border-stone-200/80 dark:border-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-300 transition active:scale-95"
              title="Toggle Theme"
            >
              {darkMode ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-stone-600" />}
            </button>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;
