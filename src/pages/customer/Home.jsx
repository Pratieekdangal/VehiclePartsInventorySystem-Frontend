import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star, Car, Calendar, Inbox, ChevronRight, AlertTriangle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { reports, appointments } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import { formatNpr, formatDateTime } from '../../lib/format';
import { cn } from '../../lib/cn';

export default function CustomerHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    reports.customerDashboard().then(setStats).catch(() => {});
    appointments.mine().then((a) => {
      const future = a
        .filter((x) => x.status !== 'Cancelled' && new Date(x.appointmentDate) > new Date())
        .sort((x, y) => new Date(x.appointmentDate) - new Date(y.appointmentDate));
      setUpcoming(future.slice(0, 1));
    }).catch(() => {});
  }, []);

  const firstName = user?.fullName?.split(' ')[0] ?? 'there';
  const isRegular = stats && stats.totalPurchases >= 3;
  const hasOverdue = stats && stats.pendingCredit > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="px-1">
        <p className="text-sm text-fg-3">Namaste,</p>
        <h1 className="font-display font-extrabold text-2xl tracking-display">{firstName}</h1>
      </div>

      {/* Loyalty progress card */}
      <div
        className="relative overflow-hidden rounded-lg border border-amber-200 p-3.5"
        style={{ background: 'linear-gradient(135deg, #fff8eb, #ffecc4)' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 90% 10%, rgba(245,165,36,0.20), transparent 60%)',
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-white shrink-0">
            <Star className="w-4.5 h-4.5 fill-white" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm text-amber-700">
              {isRegular ? "You're a regular!" : 'Welcome to VPS'}
            </div>
            <div className="text-[11px] text-amber-600">
              Spend Rs. 5,000+ in one visit for 10% off
            </div>
          </div>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <MiniStat label="Total spent" value={formatNpr(stats?.totalSpent ?? 0)} />
        <MiniStat label="Visits" value={stats?.totalPurchases ?? 0} />
      </div>

      {hasOverdue && (
        <div className="rounded-lg border border-crimson-200 bg-crimson-50 p-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4.5 h-4.5 text-crimson-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-crimson-700">Outstanding payment</p>
            <p className="text-crimson-600 text-xs mt-0.5">
              You have {formatNpr(stats.pendingCredit)} pending. Visit the workshop to settle it.
            </p>
          </div>
        </div>
      )}

      {/* Upcoming appointment */}
      {upcoming.length > 0 && (
        <Card className="p-4">
          <div className="flex items-start gap-2.5">
            <div className="w-10 h-10 rounded-md bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] vps-caption">Upcoming appointment</p>
              <p className="font-semibold text-sm mt-0.5">{upcoming[0].serviceType}</p>
              <p className="text-xs text-fg-3 mt-0.5">{formatDateTime(upcoming[0].appointmentDate)}</p>
            </div>
            <Link to="/customer/book" className="text-primary-700 text-xs font-semibold inline-flex items-center gap-0.5">
              View<ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      )}

      {/* Action cards */}
      <div className="flex flex-col gap-2.5">
        <ActionCard
          to="/customer/book"
          icon={<Calendar className="w-5 h-5" />}
          accent="bg-primary-50 text-primary-700"
          title="Book a service"
          subtitle="Pick a vehicle and a time slot"
        />
        <ActionCard
          to="/customer/requests"
          icon={<Inbox className="w-5 h-5" />}
          accent="bg-amber-50 text-amber-700"
          title="Request a part"
          subtitle="Ask for parts not in our catalogue"
        />
        <ActionCard
          to="/customer/reviews"
          icon={<Star className="w-5 h-5" />}
          accent="bg-emerald-50 text-emerald-700"
          title="Leave a review"
          subtitle="Tell us how your last visit went"
        />
      </div>

      {/* Quick links */}
      <Card className="overflow-hidden">
        <Link
          to="/customer/profile"
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-bg-subtle border-b border-border"
        >
          <Car className="w-4.5 h-4.5 text-fg-2" />
          <span className="text-sm font-semibold flex-1">My vehicles</span>
          <span className="font-mono text-fg-3 text-sm">{stats?.vehicleCount ?? 0}</span>
          <ChevronRight className="w-3.5 h-3.5 text-fg-3" />
        </Link>
      </Card>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-surface border border-border rounded-md p-3">
      <p className="vps-caption">{label}</p>
      <p className="font-display font-extrabold text-xl mt-1 tracking-h2 truncate">{value}</p>
    </div>
  );
}

function ActionCard({ to, icon, accent, title, subtitle }) {
  return (
    <Link
      to={to}
      className={cn(
        'bg-surface border border-border rounded-lg p-4 flex items-center gap-3.5',
        'transition-colors hover:bg-bg-subtle active:scale-[0.99]',
      )}
    >
      <span className={cn('w-11 h-11 rounded-md flex items-center justify-center shrink-0', accent)}>
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-bold text-sm">{title}</span>
        <span className="block text-xs text-fg-3 mt-0.5">{subtitle}</span>
      </span>
      <ChevronRight className="w-4 h-4 text-fg-3" />
    </Link>
  );
}
