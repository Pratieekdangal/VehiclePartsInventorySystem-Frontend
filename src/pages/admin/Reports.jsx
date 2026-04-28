import { useEffect, useState } from 'react';
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import PageHeader from '../../components/layout/PageHeader';
import { Card, CardHead } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import { Table, THead, TBody, Tr, Th, Td } from '../../components/ui/Table';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { LoyaltyPill } from '../../components/ui/Pill';
import Avatar from '../../components/ui/Avatar';
import { reports } from '../../api/endpoints';
import { formatNpr, formatPhone } from '../../lib/format';
import { cn } from '../../lib/cn';

const RANGES = [
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function AdminReports() {
  const [range, setRange] = useState('monthly');
  const [financial, setFinancial] = useState(null);
  const [topSpenders, setTopSpenders] = useState(null);
  const [regulars, setRegulars] = useState(null);
  const [pendingCredits, setPendingCredits] = useState(null);

  useEffect(() => {
    setFinancial(null);
    reports.financial(range).then(setFinancial).catch(() => {});
  }, [range]);

  useEffect(() => {
    reports.topSpenders(8).then(setTopSpenders).catch(() => {});
    reports.regulars(3).then(setRegulars).catch(() => {});
    reports.pendingCredits().then(setPendingCredits).catch(() => {});
  }, []);

  const chartData = financial?.rows ?? [];

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Financial performance and customer insights."
      />

      <div className="flex items-center gap-2 mb-4">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors',
              range === r.value
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-surface text-fg-2 border-border-strong hover:bg-bg-subtle',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
        <StatCard
          label="Total revenue"
          value={formatNpr(financial?.totalRevenue ?? 0)}
          delta={`across ${chartData.length} ${range === 'yearly' ? 'years' : range === 'monthly' ? 'months' : 'days'}`}
          deltaTone="up"
        />
        <StatCard
          label="Total cost"
          value={formatNpr(financial?.totalCost ?? 0)}
          delta="parts purchase basis"
          deltaTone="neutral"
        />
        <StatCard
          label="Total profit"
          value={formatNpr(financial?.totalProfit ?? 0)}
          delta={
            financial && financial.totalRevenue > 0
              ? `Margin ${((financial.totalProfit / financial.totalRevenue) * 100).toFixed(1)}%`
              : '—'
          }
          deltaTone="up"
        />
      </div>

      <Card className="mb-5">
        <CardHead title={`${range[0].toUpperCase()}${range.slice(1)} performance`} meta="Revenue vs profit" />
        <div className="p-5">
          {chartData.length === 0 ? (
            <EmptyState
              icon={() => null}
              title="No sales in this range"
              body="Once invoices land in this window, you'll see them broken down here."
            />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#e4e7ec" vertical={false} />
                <XAxis dataKey="period" fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis
                  fontSize={11}
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  width={48}
                />
                <Tooltip
                  formatter={(v) => formatNpr(v)}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e7ec' }}
                  cursor={{ fill: 'rgba(44, 95, 217, 0.06)' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                <Bar dataKey="revenue" fill="#2c5fd9" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#10a965" name="Profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <CustomerListCard
          title="Top spenders"
          rows={topSpenders}
          metric="totalSpent"
          metricLabel="spent"
        />
        <CustomerListCard
          title="Regulars (3+ visits)"
          rows={regulars}
          metric="invoiceCount"
          metricLabel="visits"
          loyalty
        />
      </div>

      <div className="mt-3.5">
        <Card>
          <CardHead
            title="Pending credits"
            meta={pendingCredits?.length ? <span className="text-crimson-600 font-semibold">{pendingCredits.length} customers owe payment</span> : null}
          />
          <Table>
            <THead>
              <Th>Customer</Th>
              <Th>Phone</Th>
              <Th align="right">Invoices</Th>
              <Th align="right">Pending</Th>
            </THead>
            <TBody empty="No outstanding payments — all caught up.">
              {pendingCredits === null
                ? Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
                : pendingCredits.length === 0
                  ? null
                  : pendingCredits.map((c) => (
                      <Tr key={c.customerId}>
                        <Td>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={c.fullName} size={28} />
                            <span className="font-semibold">{c.fullName}</span>
                          </div>
                        </Td>
                        <Td mono className="text-xs">{formatPhone(c.phoneNumber)}</Td>
                        <Td align="right" mono>{c.invoiceCount}</Td>
                        <Td align="right" mono className="font-bold text-crimson-700">
                          {formatNpr(c.pendingCredit)}
                        </Td>
                      </Tr>
                    ))}
            </TBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

function CustomerListCard({ title, rows, metric, metricLabel, loyalty }) {
  return (
    <Card>
      <CardHead title={title} meta={rows ? `${rows.length} customers` : null} />
      <Table>
        <THead>
          <Th>Customer</Th>
          <Th align="right">Visits</Th>
          <Th align="right">{metricLabel}</Th>
        </THead>
        <TBody empty="No data yet.">
          {rows === null
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={3} />)
            : rows.length === 0
              ? null
              : rows.map((c) => (
                  <Tr key={c.customerId}>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.fullName} size={28} />
                        <div className="min-w-0">
                          <div className="font-semibold flex items-center gap-2">
                            <span className="truncate">{c.fullName}</span>
                            {loyalty && c.invoiceCount >= 3 && <LoyaltyPill>★ Regular</LoyaltyPill>}
                          </div>
                          <div className="text-xs text-fg-3 font-mono">{formatPhone(c.phoneNumber)}</div>
                        </div>
                      </div>
                    </Td>
                    <Td align="right" mono>{c.invoiceCount}</Td>
                    <Td align="right" mono className="font-bold">
                      {metric === 'totalSpent' ? formatNpr(c.totalSpent) : c.invoiceCount}
                    </Td>
                  </Tr>
                ))}
        </TBody>
      </Table>
    </Card>
  );
}
