import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings } from 'lucide-react';
import { notifications as notifApi } from '../../api/endpoints';
import { cn } from '../../lib/cn';

export default function Topbar({ title, crumb, actions, notificationsTo }) {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let alive = true;
    const tick = () =>
      notifApi
        .unreadCount()
        .then((n) => alive && setUnread(n))
        .catch(() => {});
    tick();
    const id = setInterval(tick, 30000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <header className="h-14 sticky top-0 z-10 flex items-center px-6 gap-3.5 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="min-w-0">
        {crumb && <p className="text-xs text-fg-3 mb-0.5">{crumb}</p>}
        {title && (
          <h1 className="font-display font-bold text-lg tracking-h2 text-fg-1 truncate">
            {title}
          </h1>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        {actions}
        <button
          onClick={() => notificationsTo && navigate(notificationsTo)}
          aria-label="Notifications"
          className="relative w-9 h-9 rounded-sm flex items-center justify-center text-fg-2 hover:bg-bg-subtle transition-colors"
        >
          <Bell className="w-4.5 h-4.5" />
          {unread > 0 && (
            <span
              className={cn(
                'absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-pill bg-crimson-500 text-white text-[10px] font-bold flex items-center justify-center',
              )}
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
        <button
          aria-label="Settings"
          className="w-9 h-9 rounded-sm flex items-center justify-center text-fg-2 hover:bg-bg-subtle transition-colors"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  );
}
