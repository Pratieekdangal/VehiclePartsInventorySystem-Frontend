import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../store/auth';
import Avatar from '../ui/Avatar';
import Logo from '../ui/Logo';
import { cn } from '../../lib/cn';

const roleTagClass = {
  Admin: 'bg-primary-800 text-white',
  Staff: 'bg-primary-600 text-white',
  Customer: 'bg-amber-400 text-amber-700',
};

export default function Sidebar({ items, sectionLabel = 'Workspace' }) {
  const { user, logout } = useAuth();
  const role = user?.role || 'Customer';

  return (
    <aside className="bg-surface border-r border-border flex flex-col sticky top-0 h-screen w-60 shrink-0">
      <div className="px-5 py-4 flex items-center gap-2.5 border-b border-border">
        <Logo size={28} />
        <span className="font-display font-extrabold text-lg tracking-h2">VPS</span>
        <span
          className={cn(
            'ml-auto px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-caption',
            roleTagClass[role],
          )}
        >
          {role}
        </span>
      </div>

      <nav className="flex flex-col flex-1 p-2.5 gap-0.5 overflow-y-auto">
        <p className="px-2.5 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-caption text-fg-3">
          {sectionLabel}
        </p>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-sm font-medium transition-colors duration-fast',
                isActive
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-fg-2 hover:bg-bg-subtle hover:text-fg-1',
              )
            }
          >
            {item.icon && <item.icon className="w-4.5 h-4.5 shrink-0" />}
            <span>{item.label}</span>
            {item.badge ? (
              <span className="ml-auto bg-crimson-500 text-white text-[10px] font-bold px-1.5 rounded-pill">
                {item.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border flex items-center gap-2.5">
        <Avatar name={user?.fullName} size={32} />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold truncate">{user?.fullName}</div>
          <div className="text-[11px] text-fg-3 truncate">{user?.email}</div>
        </div>
        <button
          onClick={logout}
          aria-label="Sign out"
          className="p-1.5 rounded-sm text-fg-3 hover:bg-bg-subtle hover:text-crimson-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
