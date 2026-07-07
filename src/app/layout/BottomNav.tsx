import { BarChart3, FolderOpen, Home, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: '今天', icon: Home },
  { to: '/stats', label: '統計', icon: BarChart3 },
  { to: '/organize', label: '整理', icon: FolderOpen },
  { to: '/settings', label: '設定', icon: Settings },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="主導航"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs ${
                isActive ? 'font-medium text-indigo-600' : 'text-gray-400'
              }`
            }
          >
            <Icon size={22} aria-hidden />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
