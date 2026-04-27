import PageHeader from '../../components/layout/PageHeader';
import { Card, CardBody } from '../../components/ui/Card';

export default function CustomerHome() {
  return (
    <div>
      <PageHeader
        title="Namaste"
        subtitle="Your service activity at a glance."
      />
      <Card>
        <CardBody>
          <p className="vps-body-sm">
            Customer home (mobile-first) lands here next: loyalty progress card,
            mini-stats, three action cards, upcoming appointment.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
