import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, Settings, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../store/auth';
import { notifications as notifApi } from '../../api/endpoints';
import { cn } from '../../lib/cn';

// Mobile-first shell for the Customer role.
// Top bar 56px, bottom tab bar 64px, body scrolls between.
// Width capped at 480px on desktop so it still reads as a phone, but
// keep responsive — design system says fluid with 16px gutters.

export default function MobileShell({ tabs, notificationsTo, settingsTo }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let alive = true;
    const tick = () => notifApi.unreadCount().then((n) => alive && setUnread(n)).catch(() => {});
    tick();
    const id = setInterval(tick, 30000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <div className="min-h-screen bg-bg flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen relative bg-bg">
        <header className="h-14 sticky top-0 z-10 flex items-center px-4 gap-2.5 bg-surface/95 backdrop-blur-md border-b border-border">
          <h1 className="font-display font-bold text-base flex-1 truncate">
            {user?.fullName?.split(' ')[0] ? `Hi, ${user.fullName.split(' ')[0]}` : 'VPS'}
          </h1>
          <button
            onClick={() => notificationsTo && navigate(notificationsTo)}
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-fg-2 hover:bg-bg-subtle"
          >
            <Bell className="w-4.5 h-4.5" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-crimson-500 ring-2 ring-surface" />
            )}
          </button>
          {settingsTo && (
            <button
              onClick={() => navigate(settingsTo)}
              aria-label="Settings"
              className="w-9 h-9 rounded-full flex items-center justify-center text-fg-2 hover:bg-bg-subtle"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          )}
        </header>

        <main className="flex-1 px-4 pt-4 pb-24 overflow-x-hidden">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-[480px] h-16 px-2 py-1.5 bg-surface/95 backdrop-blur-md border-t border-border flex">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) => cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 rounded-md text-[10px] font-semibold transition-colors',
                isActive ? 'text-primary-500' : 'text-fg-3 active:scale-95',
              )}
            >
              <t.icon className="w-5.5 h-5.5" />
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

// Optional sub-page header — for inner customer screens that want a back button.
export function MobileSubHeader({ title, onBack }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 mb-4 -mt-1">
      <button
        onClick={onBack || (() => navigate(-1))}
        aria-label="Back"
        className="w-9 h-9 -ml-2 flex items-center justify-center rounded-full text-fg-2 hover:bg-bg-subtle"
      >
        <ArrowLeft className="w-4.5 h-4.5" />
      </button>
      <h2 className="font-display font-bold text-xl tracking-h2">{title}</h2>
    </div>
  );
}
