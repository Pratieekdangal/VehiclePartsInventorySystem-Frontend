import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { Card, CardHead } from '../../components/ui/Card';
import { Table, THead, TBody, Tr, Th, Td } from '../../components/ui/Table';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { LoyaltyPill } from '../../components/ui/Pill';
import Avatar from '../../components/ui/Avatar';
import { reports } from '../../api/endpoints';
import { formatNpr, formatPhone } from '../../lib/format';
import { cn } from '../../lib/cn';

const TABS = [
  { id: 'top', label: 'Top spenders', loader: () => reports.topSpenders(15) },
  { id: 'regulars', label: 'Regulars', loader: () => reports.regulars(3) },
  { id: 'pending', label: 'Pending credits', loader: () => reports.pendingCredits() },
];

export default function StaffReports() {
  const [tab, setTab] = useState('top');
  const [rows, setRows] = useState(null);

  useEffect(() => {
    setRows(null);
    const cfg = TABS.find((t) => t.id === tab);
    cfg.loader().then(setRows).catch(() => setRows([]));
  }, [tab]);

  return (
    <div>
      <PageHeader
        title="Customer reports"
        subtitle="Identify regulars, top spenders, and customers with overdue payments."
      />

      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-3.5 py-1.5 text-sm font-semibold rounded-sm border transition-colors',
              tab === t.id
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-surface text-fg-2 border-border-strong hover:bg-bg-subtle',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHead title={TABS.find((t) => t.id === tab).label} meta={rows ? `${rows.length} customers` : null} />
        <Table>
          <THead>
            <Th>Customer</Th>
            <Th>Phone</Th>
            <Th align="right">Visits</Th>
            <Th align="right">Total spent</Th>
            <Th align="right">Pending</Th>
            <Th />
          </THead>
          <TBody empty="No data for this report yet.">
            {rows === null
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              : rows.length === 0
                ? null
                : rows.map((c) => (
                    <Tr key={c.customerId}>
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={c.fullName} size={32} />
                          <div>
                            <div className="font-semibold flex items-center gap-2">
                              {c.fullName}
                              {c.invoiceCount >= 3 && <LoyaltyPill>★ Regular</LoyaltyPill>}
                            </div>
                          </div>
                        </div>
                      </Td>
                      <Td mono className="text-xs">{formatPhone(c.phoneNumber)}</Td>
                      <Td align="right" mono>{c.invoiceCount}</Td>
                      <Td align="right" mono className="font-bold">{formatNpr(c.totalSpent)}</Td>
                      <Td align="right" mono className={c.pendingCredit > 0 ? 'text-crimson-700 font-bold' : 'text-fg-3'}>
                        {formatNpr(c.pendingCredit)}
                      </Td>
                      <Td align="right">
                        <Link
                          to={`/staff/customers/${c.customerId}`}
                          className="inline-flex items-center gap-1 text-sm text-primary-700 hover:underline font-semibold"
                        >
                          View<ChevronRight className="w-3 h-3" />
                        </Link>
                      </Td>
                    </Tr>
                  ))}
          </TBody>
        </Table>

        {rows?.length === 0 && (
          <EmptyState
            icon={() => null}
            title="Nothing here yet"
            body={
              tab === 'pending'
                ? 'No outstanding payments — every invoice is settled.'
                : 'Once invoices accumulate, top spenders and regulars surface here.'
            }
          />
        )}
      </Card>
    </div>
  );
}
