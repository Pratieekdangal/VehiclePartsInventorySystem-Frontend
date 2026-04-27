import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import { Card, CardHead, CardBody } from '../../components/ui/Card';
import { reports } from '../../api/endpoints';
import { formatNpr } from '../../lib/format';

export default function StaffDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    reports.staffDashboard().then(setStats).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader
        title="Today at the counter"
        subtitle="Walk-ins, sales, and follow-ups."
        actions={
          <Button as={Link} to="/staff/new-sale">
            <Plus />
            Start a sale
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <StatCard
          label="Walk-ins"
          value={stats?.customersToday ?? '—'}
          delta={`${stats?.salesToday ?? 0} invoices`}
          deltaTone="neutral"
        />
        <StatCard
          label="Sales today"
          value={formatNpr(stats?.salesAmountToday)}
          delta="Today's takings"
          deltaTone="up"
        />
        <StatCard
          label="Pending credits"
          value={stats?.pendingCreditCount ?? 0}
          delta={formatNpr(stats?.pendingCreditAmount)}
          deltaTone="neutral"
        />
        <StatCard
          label="Loyalty applied"
          value={stats?.loyaltyApplied ?? 0}
          delta="this week"
          deltaTone="neutral"
        />
      </div>

      <Card>
        <CardHead title="Recent invoices" meta="Last 10 sales" />
        <CardBody>
          <p className="vps-body-sm">
            Recent invoices table will populate from the sales endpoint.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
