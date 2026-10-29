import React from "react";
import { NavLink } from "react-router-dom";

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

export interface SidebarProps {
  title: string;
  subtitle?: string;
  items: NavItem[];
  footer?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  title,
  subtitle,
  items,
  footer,
}) => {
  return (
    <aside className="w-64 min-h-screen bg-slate-950 border-r border-slate-800 flex flex-col justify-between">
      <div>
        <div className="p-6 border-b border-slate-800/80">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            {title}
          </h2>
          {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
        </div>

        <nav className="p-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`
              }
            >
              {item.icon && <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {footer && <div className="p-4 border-t border-slate-800/80">{footer}</div>}
    </aside>
  );
};
