import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Printer, Package, AlertTriangle, FileText,
  ChevronRight, Calendar, Users, Inbox,
} from 'lucide-react';
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

import PageHeader from '../../components/layout/PageHeader';
import { Card, CardHead } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { reports, parts as partsApi, appointments } from '../../api/endpoints';
import { formatNpr, formatTime } from '../../lib/format';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [pendingAppts, setPendingAppts] = useState([]);

  useEffect(() => {
    reports.adminDashboard().then(setStats).catch(() => {});
    reports.financial('daily').then(setFinancial).catch(() => {});
    partsApi.lowStock().then((d) => setLowStock(d.slice(0, 5))).catch(() => {});
    appointments.list().then((d) => {
      const pending = d.filter((a) => a.status === 'Pending' || a.status === 'Confirmed');
      setPendingAppts(pending.slice(0, 5));
    }).catch(() => {});
  }, []);

  const chartData = (financial?.rows || []).slice(-14).map((r) => ({
    period: r.period.slice(5),
    revenue: r.revenue,
    profit: r.profit,
  }));

  const margin = stats && stats.monthlyRevenue > 0
    ? `${((stats.monthlyProfit / stats.monthlyRevenue) * 100).toFixed(1)}%`
    : '—';

  return (
    <div>
      <PageHeader
        title="Good morning"
        subtitle="Inventory, sales, and service activity at a glance."
        actions={
          <>
            <Button variant="secondary"><Printer />Export</Button>
            <Button as={Link} to="/admin/purchases"><Plus />Record purchase</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <StatCard
          label="Monthly revenue"
          value={formatNpr(stats?.monthlyRevenue)}
          delta="This month"
          deltaTone="up"
        />
        <StatCard
          label="Monthly profit"
          value={formatNpr(stats?.monthlyProfit)}
          delta={`Margin ${margin}`}
          deltaTone="neutral"
        />
        <StatCard
          label="Active parts"
          value={stats?.totalParts ?? 0}
          delta={stats?.lowStockCount ? `${stats.lowStockCount} low stock` : 'All in stock'}
          deltaTone={stats?.lowStockCount ? 'down' : 'up'}
        />
        <StatCard
          label="Overdue invoices"
          value={stats?.overdueInvoices ?? 0}
          delta="payment > 30 days"
          deltaTone={stats?.overdueInvoices ? 'down' : 'neutral'}
          alert={!!stats?.overdueInvoices}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3.5 mb-3.5">
        <Card>
          <CardHead title="Revenue · last 14 days" meta="Rs. per day" />
          <div className="p-5">
            {chartData.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No sales yet"
                body="Once staff start creating invoices, this chart fills with daily revenue."
              />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#e4e7ec" vertical={false} />
                  <XAxis
                    dataKey="period"
                    fontSize={11}
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={11}
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: '1px solid #e4e7ec',
                    }}
                    formatter={(v) => formatNpr(v)}
                    labelStyle={{ fontWeight: 600 }}
                    cursor={{ fill: 'rgba(44, 95, 217, 0.06)' }}
                  />
                  <Bar dataKey="revenue" fill="#2c5fd9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <CardHead
            title="Low stock"
            meta={lowStock.length > 0 ? (
              <span className="text-crimson-600 font-semibold">{lowStock.length} below threshold</span>
            ) : null}
          />
          {lowStock.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Stock looks healthy"
              body="No parts are currently below their re-order threshold."
            />
          ) : (
            <ul>
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-2.5 px-5 py-3 border-b border-border last:border-0">
                  <div className="w-9 h-9 rounded-md bg-crimson-50 text-crimson-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="font-mono text-[11px] text-fg-3 truncate">{p.partCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-crimson-700">{p.stockQuantity}</p>
                    <p className="text-[10px] text-fg-3">min {p.lowStockThreshold}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <Card>
          <CardHead
            title="Pending appointments"
            meta={pendingAppts.length > 0 ? `${pendingAppts.length} upcoming` : null}
            action={
              <Button as={Link} to="/admin/appointments" variant="ghost" size="sm">
                View all <ChevronRight className="w-3 h-3" />
              </Button>
            }
          />
          {pendingAppts.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No appointments scheduled"
              body="Customer bookings will appear here once received."
            />
          ) : (
            <ul>
              {pendingAppts.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0">
                  <div className="font-display font-extrabold text-base text-primary-700 w-12 shrink-0">
                    {formatTime(a.appointmentDate)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {a.customerName}
                      <span className="text-fg-3 font-normal"> · {a.serviceType}</span>
                    </p>
                    {a.vehicleNumber && (
                      <p className="font-mono text-[11px] text-fg-3 truncate">{a.vehicleNumber}</p>
                    )}
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-pill font-semibold ${
                    a.status === 'Confirmed'
                      ? 'bg-primary-50 text-primary-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {a.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHead title="At a glance" />
          <ul className="px-5 py-2">
            <Glance
              icon={<Users className="w-4 h-4" />}
              label="Customers"
              value={stats?.customerCount ?? 0}
              to="/admin/staff"
            />
            <Glance
              icon={<Users className="w-4 h-4" />}
              label="Active staff"
              value={stats?.staffCount ?? 0}
              to="/admin/staff"
            />
            <Glance
              icon={<Package className="w-4 h-4" />}
              label="Vendors"
              value={stats?.vendorCount ?? 0}
              to="/admin/vendors"
            />
            <Glance
              icon={<Inbox className="w-4 h-4" />}
              label="Pending part requests"
              value={stats?.pendingPartRequests ?? 0}
              to="/admin/part-requests"
              accent={stats?.pendingPartRequests > 0}
            />
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Glance({ icon, label, value, to, accent }) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center gap-3 py-3 border-b border-border last:border-0 -mx-5 px-5 hover:bg-bg-subtle transition-colors"
      >
        <span className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
          accent ? 'bg-amber-50 text-amber-700' : 'bg-primary-50 text-primary-700'
        }`}>
          {icon}
        </span>
        <span className="flex-1 text-sm font-medium">{label}</span>
        <span className="font-mono font-bold text-fg-1">{value}</span>
        <ChevronRight className="w-3.5 h-3.5 text-fg-3" />
      </Link>
    </li>
  );
}
