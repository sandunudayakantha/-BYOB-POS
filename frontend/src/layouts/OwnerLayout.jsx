import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBranch } from '../contexts/BranchContext';
import {
  Squares2X2Icon,
  BuildingOffice2Icon,
  ShoppingBagIcon,
  DocumentTextIcon,
  FireIcon,
  QrCodeIcon,
  UserCircleIcon,
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const OwnerLayout = () => {
  const { user, logout } = useAuth();
  const { branches, activeBranch, switchBranch } = useBranch();
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
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto">
          {/* Logo Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                QR
              </div>
              <span className="font-extrabold text-base tracking-tight truncate text-slate-900">
                {user?.restaurant?.name || 'Restaurant Portal'}
              </span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links Grouped by Section */}
          <nav className="p-4 space-y-5">
            {navSections.map((section, idx) => (
              <div key={section.title || idx} className="space-y-1">
                <div className="flex items-center justify-between px-3 pb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    {section.title}
                  </span>
                  {section.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
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
                              ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm border border-emerald-200'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || 'O'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition active:scale-95"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Branch Context Dropdown */}
            {branches.length > 0 && (
              <div ref={branchDropdownRef} className="relative">
                <button
                  onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:border-emerald-500/40 hover:bg-slate-50 transition shadow-sm active:scale-95"
                >
                  <BuildingOffice2Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="leading-none">{activeBranch ? activeBranch.name : 'Select Branch'}</span>
                  <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {branchDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Active Location
                    </div>
                    {branches.map((b) => (
                      <button
                        key={b._id}
                        onClick={() => {
                          switchBranch(b);
                          setBranchDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                          activeBranch?._id === b._id ? 'font-bold text-emerald-600 bg-emerald-50' : 'text-slate-700'
                        }`}
                      >
                        <span className="truncate">{b.name}</span>
                        {b.isMain && <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">Main</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
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
