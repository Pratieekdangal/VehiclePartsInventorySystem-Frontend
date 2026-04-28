import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Calendar, Check, X } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Table, THead, TBody, Tr, Th, Td } from '../../components/ui/Table';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { StatusPill } from '../../components/ui/Pill';
import Avatar from '../../components/ui/Avatar';
import { appointments as apptApi } from '../../api/endpoints';
import { formatDateTime } from '../../lib/format';

export default function AdminAppointments() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setItems(null);
    apptApi.list().then(setItems).catch(() => toast.error('Could not load appointments'));
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (a, status) => {
    try {
      await apptApi.setStatus(a.id, status);
      toast.success(`${a.customerName}'s booking ${status.toLowerCase()}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const filtered = items === null
    ? null
    : (filter === 'all'
        ? items
        : items.filter((a) => a.status === filter));

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle="Customer service bookings — confirm, complete, or cancel."
      />

      <div className="flex gap-2 mb-4">
        {['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors ${
              filter === f
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-surface text-fg-2 border-border-strong hover:bg-bg-subtle'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      <Card>
        <Table>
          <THead>
            <Th>Date & time</Th>
            <Th>Customer</Th>
            <Th>Vehicle</Th>
            <Th>Service</Th>
            <Th>Status</Th>
            <Th />
          </THead>
          <TBody empty="No appointments match this filter">
            {filtered === null
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              : filtered.length === 0
                ? null
                : filtered.map((a) => (
                    <Tr key={a.id}>
                      <Td className="text-sm font-medium">{formatDateTime(a.appointmentDate)}</Td>
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={a.customerName} size={28} />
                          <span className="font-semibold">{a.customerName}</span>
                        </div>
                      </Td>
                      <Td mono className="text-xs">{a.vehicleNumber || '—'}</Td>
                      <Td className="text-sm">
                        <div className="font-medium">{a.serviceType}</div>
                        {a.description && <div className="text-xs text-fg-3 truncate max-w-[280px]">{a.description}</div>}
                      </Td>
                      <Td><StatusPill status={a.status} /></Td>
                      <Td align="right">
                        <div className="inline-flex gap-1.5">
                          {a.status === 'Pending' && (
                            <Button size="sm" variant="primary" onClick={() => setStatus(a, 'Confirmed')}>
                              <Check />Confirm
                            </Button>
                          )}
                          {a.status === 'Confirmed' && (
                            <Button size="sm" variant="primary" onClick={() => setStatus(a, 'Completed')}>
                              <Check />Mark complete
                            </Button>
                          )}
                          {(a.status === 'Pending' || a.status === 'Confirmed') && (
                            <Button size="sm" variant="ghost" onClick={() => setStatus(a, 'Cancelled')}>
                              <X />Cancel
                            </Button>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))}
          </TBody>
        </Table>

        {filtered?.length === 0 && (
          <EmptyState
            icon={Calendar}
            title="No appointments yet"
            body="Customers' service bookings will appear here for you to confirm."
          />
        )}
      </Card>
    </div>
  );
}
