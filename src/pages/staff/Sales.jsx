import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Mail, Wallet, Receipt } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input, SearchInput } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Table, THead, TBody, Tr, Th, Td } from '../../components/ui/Table';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { StatusPill, LoyaltyPill } from '../../components/ui/Pill';
import { sales as salesApi } from '../../api/endpoints';
import { formatNpr, formatDateTime } from '../../lib/format';

const STATUSES = ['all', 'Paid', 'PartiallyPaid', 'Pending', 'Overdue'];

export default function StaffSales() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [emailing, setEmailing] = useState(null);
  const [paying, setPaying] = useState(null);
  const [payAmount, setPayAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setItems(null);
    salesApi.list().then(setItems).catch(() => toast.error('Could not load invoices'));
  };

  useEffect(() => { load(); }, []);

  const filtered = items === null
    ? null
    : items.filter((i) => {
        if (filter !== 'all' && i.paymentStatus !== filter) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!`${i.invoiceNumber} ${i.customerName}`.toLowerCase().includes(q)) return false;
        }
        return true;
      });

  const sendEmail = async (inv) => {
    setEmailing(inv.id);
    try {
      await salesApi.email(inv.id);
      toast.success(`Invoice sent to ${inv.customerEmail}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Email failed');
    } finally {
      setEmailing(null);
    }
  };

  const recordPayment = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      await salesApi.pay(paying.id, Number(payAmount));
      toast.success('Payment recorded');
      setPaying(null);
      setPayAmount(0);
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
        title="All sales"
        subtitle="Every invoice ever recorded — filter by status, send copies, record payments."
        actions={
          <Button as={Link} to="/staff/new-sale">
            <Plus />New sale
          </Button>
        }
      />

      <Card className="mb-3.5">
        <div className="p-4 flex flex-wrap gap-2.5 items-center">
          <SearchInput
            placeholder="Search invoice # or customer name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-md"
          />
          <div className="flex gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors ${
                  filter === s
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-surface text-fg-2 border-border-strong hover:bg-bg-subtle'
                }`}
              >
                {s === 'all' ? 'All' : s === 'PartiallyPaid' ? 'Partial' : s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <Table>
          <THead>
            <Th>Invoice #</Th>
            <Th>Customer</Th>
            <Th>Date & time</Th>
            <Th align="right">Total</Th>
            <Th align="right">Balance due</Th>
            <Th>Status</Th>
            <Th />
          </THead>
          <TBody empty="No invoices match this filter">
            {filtered === null
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              : filtered.length === 0
                ? null
                : filtered.map((inv) => {
                    const overdue = inv.balanceDue > 0
                      && inv.dueDate
                      && new Date(inv.dueDate) < new Date();
                    return (
                      <Tr key={inv.id}>
                        <Td mono className="text-xs">{inv.invoiceNumber}</Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{inv.customerName}</span>
                            {inv.isLoyaltyDiscountApplied && <LoyaltyPill>★ 10% off</LoyaltyPill>}
                          </div>
                          <div className="text-xs text-fg-3">{inv.customerEmail}</div>
                        </Td>
                        <Td className="text-sm">{formatDateTime(inv.invoiceDate)}</Td>
                        <Td align="right" mono className="font-bold">{formatNpr(inv.totalAmount)}</Td>
                        <Td align="right" mono className={inv.balanceDue > 0 ? 'text-crimson-700 font-bold' : 'text-fg-3'}>
                          {formatNpr(inv.balanceDue)}
                        </Td>
                        <Td>
                          <StatusPill status={overdue ? 'Overdue' : inv.paymentStatus} />
                        </Td>
                        <Td align="right">
                          <div className="inline-flex gap-1.5">
                            {overdue ? (
                              <Button size="sm" variant="danger" onClick={() => sendEmail(inv)} disabled={emailing === inv.id}>
                                <Mail />{emailing === inv.id ? 'Sending…' : 'Send reminder'}
                              </Button>
                            ) : (
                              <Button size="sm" variant="secondary" onClick={() => sendEmail(inv)} disabled={emailing === inv.id}>
                                <Mail />{emailing === inv.id ? 'Sending…' : 'Email'}
                              </Button>
                            )}
                            {inv.balanceDue > 0 && (
                              <Button size="sm" onClick={() => { setPaying(inv); setPayAmount(inv.balanceDue); }}>
                                <Wallet />Record payment
                              </Button>
                            )}
                          </div>
                        </Td>
                      </Tr>
                    );
                  })}
          </TBody>
        </Table>

        {filtered?.length === 0 && (
          <EmptyState
            icon={Receipt}
            title="No invoices yet"
            body="Once you create a sale, invoices will land here."
            action={<Button as={Link} to="/staff/new-sale"><Plus />New sale</Button>}
          />
        )}
      </Card>

      <Modal
        open={!!paying}
        onClose={() => setPaying(null)}
        title={`Record payment on ${paying?.invoiceNumber}`}
        subtitle={paying ? `${paying.customerName} · Balance ${formatNpr(paying.balanceDue)}` : ''}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPaying(null)}>Cancel</Button>
            <Button onClick={recordPayment} disabled={submitting || !payAmount}>
              <Wallet />{submitting ? 'Recording…' : 'Record payment'}
            </Button>
          </>
        }
      >
        <form onSubmit={recordPayment} className="flex flex-col gap-3">
          <Input
            label="Amount received (Rs.)"
            type="number"
            min="0"
            max={paying?.balanceDue}
            step="0.01"
            mono
            required
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            hint={`Max ${formatNpr(paying?.balanceDue ?? 0)} — anything over the balance is ignored.`}
          />
        </form>
      </Modal>
    </div>
  );
}
