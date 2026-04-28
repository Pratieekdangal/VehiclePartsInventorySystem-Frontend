import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, AlertTriangle, Wallet, CheckCheck, Info } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import { notifications } from '../api/endpoints';
import { formatDateTime } from '../lib/format';
import { cn } from '../lib/cn';

const TYPE_META = {
  low_stock: {
    icon: AlertTriangle,
    color: 'bg-crimson-50 text-crimson-600',
  },
  overdue_credit: {
    icon: Wallet,
    color: 'bg-amber-50 text-amber-700',
  },
  default: {
    icon: Info,
    color: 'bg-primary-50 text-primary-700',
  },
};

export default function NotificationsPage() {
  const [items, setItems] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setItems(null);
    notifications.list().then(setItems).catch(() => toast.error('Could not load notifications'));
  };

  useEffect(() => { load(); }, []);

  const markAll = async () => {
    setBusy(true);
    try {
      await notifications.markAllRead();
      toast.success('All marked as read');
      load();
    } catch {
      toast.error('Failed');
    } finally {
      setBusy(false);
    }
  };

  const markOne = async (id) => {
    try {
      await notifications.markRead(id);
      load();
    } catch { /* silent */ }
  };

  const unreadCount = items?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={
          items
            ? unreadCount > 0
              ? `${unreadCount} unread`
              : 'All caught up'
            : ' '
        }
        actions={
          unreadCount > 0 && (
            <Button variant="secondary" onClick={markAll} disabled={busy}>
              <CheckCheck />Mark all read
            </Button>
          )
        }
      />

      {items === null ? (
        <Card className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-5">
              <Skeleton className="w-10 h-10 rounded-md shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          body="System alerts (low stock, overdue payments) and updates will appear here."
        />
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {items.map((n) => {
            const meta = TYPE_META[n.type] || TYPE_META.default;
            const Icon = meta.icon;
            return (
              <div
                key={n.id}
                className={cn(
                  'flex items-start gap-3 p-5 transition-colors',
                  !n.isRead && 'bg-primary-50/40',
                )}
              >
                <div className={cn('w-10 h-10 rounded-md flex items-center justify-center shrink-0', meta.color)}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <h3 className="font-semibold text-sm flex-1">{n.title}</h3>
                    {!n.isRead && (
                      <button
                        onClick={() => markOne(n.id)}
                        className="text-[11px] text-primary-700 font-semibold hover:underline shrink-0"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-fg-2 mt-0.5">{n.message}</p>
                  <p className="text-[11px] text-fg-3 mt-1.5">{formatDateTime(n.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
