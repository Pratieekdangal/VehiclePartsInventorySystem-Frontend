import PageHeader from '../../components/layout/PageHeader';
import { Card, CardBody } from '../../components/ui/Card';

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader
        title="Good morning"
        subtitle="Inventory, sales, and service activity at a glance."
      />
      <Card>
        <CardBody>
          <p className="vps-body-sm">
            Admin dashboard pages will land here once the design pass continues
            (KPI grid, 14-day revenue chart, low-stock panel, recent activity).
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
