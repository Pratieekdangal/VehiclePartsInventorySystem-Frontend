import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Mail, ChevronRight, Receipt } from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import { Card, CardHead } from '../../components/ui/Card';
import { Table, THead, TBody, Tr, Th, Td } from '../../components/ui/Table';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { StatusPill, LoyaltyPill } from '../../components/ui/Pill';

import { reports, sales } from '../../api/endpoints';
import { formatNpr, formatTime } from '../../lib/format';

export default function StaffDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);
  const [emailing, setEmailing] = useState(null);

  useEffect(() => {
    reports.staffDashboard().then(setStats).catch(() => {});
    sales.list()
      .then((rows) => setRecent(rows.slice(0, 10)))
      .catch(() => setRecent([]));
  }, []);

  const sendEmail = async (inv) => {
    setEmailing(inv.id);
    try {
      await sales.email(inv.id);
      toast.success(`Invoice sent to ${inv.customerEmail}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Email failed — check SMTP settings');
    } finally {
      setEmailing(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Today at the counter"
        subtitle="Walk-ins, sales, and follow-ups."
        actions={
          <Button as={Link} to="/staff/new-sale">
            <Plus />Start a sale
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <StatCard
          label="Walk-ins"
          value={stats?.customersToday ?? '—'}
          delta={`${stats?.salesToday ?? 0} invoices today`}
          deltaTone="neutral"
        />
        <StatCard
          label="Sales today"
          value={formatNpr(stats?.salesAmountToday)}
          delta="Today's takings"
          deltaTone="up"
        />
        <StatCard
          label="Loyalty applied"
          value={stats?.loyaltyAppliedToday ?? 0}
          delta={
            stats?.loyaltySavingsToday > 0
              ? `${formatNpr(stats.loyaltySavingsToday)} saved`
              : 'No discounts yet today'
          }
          deltaTone={stats?.loyaltyAppliedToday > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          label="Pending credits"
          value={stats?.pendingCreditCount ?? 0}
          delta={formatNpr(stats?.pendingCreditAmount)}
          deltaTone={stats?.pendingCreditCount > 0 ? 'down' : 'neutral'}
          alert={stats?.pendingCreditCount > 0}
        />
      </div>

      <Card>
        <CardHead
          title="Recent invoices"
          meta={recent?.length ? `Last ${recent.length}` : null}
          action={
            <Button as={Link} to="/staff/sales" variant="ghost" size="sm">
              View all <ChevronRight className="w-3 h-3" />
            </Button>
          }
        />

        <Table>
          <THead>
            <Th>Invoice</Th>
            <Th>Customer</Th>
            <Th>Time</Th>
            <Th align="right">Total</Th>
            <Th>Status</Th>
            <Th />
          </THead>
          <TBody empty="No sales yet today.">
            {recent === null
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              : recent.length === 0
                ? null
                : recent.map((inv) => (
                    <Tr key={inv.id}>
                      <Td mono className="text-xs">{inv.invoiceNumber}</Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{inv.customerName}</span>
                          {inv.isLoyaltyDiscountApplied && <LoyaltyPill>★ Loyalty</LoyaltyPill>}
                        </div>
                      </Td>
                      <Td className="text-sm">{formatTime(inv.invoiceDate)}</Td>
                      <Td align="right" mono className="font-bold">{formatNpr(inv.totalAmount)}</Td>
                      <Td><StatusPill status={inv.paymentStatus} /></Td>
                      <Td align="right">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => sendEmail(inv)}
                          disabled={emailing === inv.id}
                        >
                          <Mail />{emailing === inv.id ? 'Sending…' : 'Email'}
                        </Button>
                      </Td>
                    </Tr>
                  ))}
          </TBody>
        </Table>

        {recent?.length === 0 && (
          <EmptyState
            icon={Receipt}
            title="No invoices yet"
            body="Once you start creating sales today, they'll show up here for quick follow-up."
            action={<Button as={Link} to="/staff/new-sale"><Plus />Start a sale</Button>}
          />
        )}
      </Card>
    </div>
  );
}
