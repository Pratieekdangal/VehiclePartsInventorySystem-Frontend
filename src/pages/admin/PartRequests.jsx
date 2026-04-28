import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Inbox, Check, X } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Table, THead, TBody, Tr, Th, Td } from '../../components/ui/Table';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { StatusPill } from '../../components/ui/Pill';
import Avatar from '../../components/ui/Avatar';
import { partRequests } from '../../api/endpoints';
import { formatDate } from '../../lib/format';

export default function AdminPartRequests() {
  const [items, setItems] = useState(null);
  const [responding, setResponding] = useState(null);
  const [decision, setDecision] = useState({ status: 'Fulfilled', adminResponse: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setItems(null);
    partRequests.list().then(setItems).catch(() => toast.error('Could not load requests'));
  };

  useEffect(() => { load(); }, []);

  const respond = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      await partRequests.respond(responding.id, decision);
      toast.success(`Reply sent to ${responding.customerName}`);
      setResponding(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Part requests"
        subtitle="Customers asking for parts not in catalogue — respond with sourcing or rejection."
      />

      <Card>
        <Table>
          <THead>
            <Th>Customer</Th>
            <Th>Part requested</Th>
            <Th>For vehicle</Th>
            <Th>Submitted</Th>
            <Th>Status</Th>
            <Th />
          </THead>
          <TBody empty="No requests yet">
            {items === null
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              : items.length === 0
                ? null
                : items.map((r) => (
                    <Tr key={r.id}>
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={r.customerName} size={28} />
                          <span className="font-semibold">{r.customerName}</span>
                        </div>
                      </Td>
                      <Td>
                        <div className="font-semibold">{r.partName}</div>
                        {r.description && (
                          <div className="text-xs text-fg-3 max-w-[300px] truncate">{r.description}</div>
                        )}
                      </Td>
                      <Td className="text-sm">{r.compatibleVehicle || '—'}</Td>
                      <Td className="text-xs text-fg-3">{formatDate(r.createdAt)}</Td>
                      <Td><StatusPill status={r.status} /></Td>
                      <Td align="right">
                        {r.status === 'Pending' ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setResponding(r);
                              setDecision({ status: 'Fulfilled', adminResponse: '' });
                            }}
                          >
                            Respond
                          </Button>
                        ) : (
                          <span className="text-xs text-fg-3">{r.adminResponse || '—'}</span>
                        )}
                      </Td>
                    </Tr>
                  ))}
          </TBody>
        </Table>

        {items?.length === 0 && (
          <EmptyState
            icon={Inbox}
            title="No part requests yet"
            body="Customers can request parts that aren't in your catalogue. They'll appear here for you to respond to."
          />
        )}
      </Card>

      <Modal
        open={!!responding}
        onClose={() => setResponding(null)}
        title={`Respond to ${responding?.customerName}`}
        subtitle={responding?.partName}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResponding(null)}>Cancel</Button>
            <Button onClick={respond} disabled={submitting}>
              {submitting ? 'Sending…' : 'Send response'}
            </Button>
          </>
        }
      >
        <form onSubmit={respond} className="flex flex-col gap-4">
          <div>
            <span className="vps-label mb-2 block">Your decision</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDecision({ ...decision, status: 'Fulfilled' })}
                className={`flex items-center gap-2 px-3 py-3 rounded-sm border text-sm font-semibold transition-colors ${
                  decision.status === 'Fulfilled'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'border-border-strong text-fg-2 hover:bg-bg-subtle'
                }`}
              >
                <Check className="w-4 h-4" />Fulfil
              </button>
              <button
                type="button"
                onClick={() => setDecision({ ...decision, status: 'Rejected' })}
                className={`flex items-center gap-2 px-3 py-3 rounded-sm border text-sm font-semibold transition-colors ${
                  decision.status === 'Rejected'
                    ? 'bg-crimson-50 border-crimson-200 text-crimson-700'
                    : 'border-border-strong text-fg-2 hover:bg-bg-subtle'
                }`}
              >
                <X className="w-4 h-4" />Reject
              </button>
            </div>
          </div>

          <Textarea
            label="Message to customer"
            required
            rows={4}
            value={decision.adminResponse}
            onChange={(e) => setDecision({ ...decision, adminResponse: e.target.value })}
            placeholder={
              decision.status === 'Fulfilled'
                ? 'We can source this in 3-5 days. Visit to confirm.'
                : 'Sorry, this part is no longer available from our suppliers.'
            }
          />
        </form>
      </Modal>
    </div>
  );
}
