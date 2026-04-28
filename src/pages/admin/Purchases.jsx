import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, FileText, Package } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input, Select, Textarea, Field } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Table, THead, TBody, Tr, Th, Td } from '../../components/ui/Table';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { purchases as purchasesApi, vendors as vendorsApi, parts as partsApi } from '../../api/endpoints';
import { formatNpr, formatDate } from '../../lib/format';

export default function AdminPurchases() {
  const [items, setItems] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [allParts, setAllParts] = useState([]);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ vendorId: '', notes: '', lines: [{ partId: '', quantity: 1, unitPrice: 0 }] });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setItems(null);
    purchasesApi.list().then(setItems).catch(() => toast.error('Could not load purchase invoices'));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    vendorsApi.list().then(setVendors).catch(() => {});
    partsApi.list().then(setAllParts).catch(() => {});
  }, []);

  const open = () => {
    setDraft({ vendorId: '', notes: '', lines: [{ partId: '', quantity: 1, unitPrice: 0 }] });
    setCreating(true);
  };

  const updateLine = (i, k, v) => {
    const next = [...draft.lines];
    next[i] = { ...next[i], [k]: v };
    if (k === 'partId') {
      const part = allParts.find((p) => p.id === v);
      if (part) next[i].unitPrice = part.purchasePrice || 0;
    }
    setDraft({ ...draft, lines: next });
  };

  const total = draft.lines.reduce(
    (s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0),
    0,
  );

  const submit = async (e) => {
    e?.preventDefault();
    if (!draft.vendorId || draft.lines.some((l) => !l.partId)) {
      toast.error('Pick a vendor and at least one part');
      return;
    }
    setSubmitting(true);
    try {
      await purchasesApi.create({
        vendorId: draft.vendorId,
        notes: draft.notes,
        items: draft.lines.map((l) => ({
          partId: l.partId,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
        })),
      });
      toast.success('Purchase recorded — stock updated');
      setCreating(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not record purchase');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Purchase invoices"
        subtitle="Record stock arrivals from vendors. Stock updates automatically."
        actions={<Button onClick={open}><Plus />Record purchase</Button>}
      />

      <Card>
        <Table>
          <THead>
            <Th>Invoice #</Th>
            <Th>Vendor</Th>
            <Th>Date</Th>
            <Th align="right">Items</Th>
            <Th align="right">Total</Th>
            <Th>Notes</Th>
          </THead>
          <TBody empty="No purchase invoices yet">
            {items === null
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              : items.length === 0
                ? null
                : items.map((p) => (
                    <Tr key={p.id}>
                      <Td mono className="text-xs">{p.invoiceNumber}</Td>
                      <Td className="font-semibold">{p.vendorName}</Td>
                      <Td className="text-sm">{formatDate(p.invoiceDate)}</Td>
                      <Td align="right" mono>{p.items?.length || 0}</Td>
                      <Td align="right" mono className="font-bold">{formatNpr(p.totalAmount)}</Td>
                      <Td className="text-sm text-fg-2 max-w-[280px] truncate">{p.notes || '—'}</Td>
                    </Tr>
                  ))}
          </TBody>
        </Table>

        {items?.length === 0 && (
          <EmptyState
            icon={FileText}
            title="No purchase invoices yet"
            body="Record your first purchase from a vendor to track inventory in. Stock and unit cost update automatically."
            action={<Button onClick={open}><Plus />Record purchase</Button>}
          />
        )}
      </Card>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Record a purchase"
        subtitle="Pick the vendor and add the parts they delivered. Stock and average cost will update."
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={submit} disabled={submitting}>
              <Plus />{submitting ? 'Recording…' : 'Record purchase'}
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Select
            label="Vendor"
            required
            value={draft.vendorId}
            onChange={(e) => setDraft({ ...draft, vendorId: e.target.value })}
          >
            <option value="">Pick a vendor…</option>
            {vendors.filter((v) => v.isActive).map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </Select>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="vps-label">Line items</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setDraft({ ...draft, lines: [...draft.lines, { partId: '', quantity: 1, unitPrice: 0 }] })
                }
              >
                <Plus />Add line
              </Button>
            </div>

            <div className="rounded-md border border-border overflow-hidden">
              <div
                className="grid bg-bg-subtle px-3 py-2 text-[11px] font-semibold text-fg-3 uppercase tracking-caption border-b border-border"
                style={{ gridTemplateColumns: '1fr 90px 120px 120px 36px' }}
              >
                <span>Part</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Unit cost</span>
                <span className="text-right">Subtotal</span>
                <span />
              </div>
              {draft.lines.map((l, i) => (
                <div
                  key={i}
                  className="grid items-center px-3 py-2 border-b border-border last:border-0"
                  style={{ gridTemplateColumns: '1fr 90px 120px 120px 36px' }}
                >
                  <Select
                    value={l.partId}
                    onChange={(e) => updateLine(i, 'partId', e.target.value)}
                  >
                    <option value="">Select part…</option>
                    {allParts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.partCode})
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    mono
                    value={l.quantity}
                    onChange={(e) => updateLine(i, 'quantity', e.target.value)}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    mono
                    value={l.unitPrice}
                    onChange={(e) => updateLine(i, 'unitPrice', e.target.value)}
                  />
                  <span className="text-right vps-money font-bold pr-2">
                    {formatNpr((Number(l.quantity) || 0) * (Number(l.unitPrice) || 0))}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, lines: draft.lines.filter((_, idx) => idx !== i) })}
                    disabled={draft.lines.length === 1}
                    className="p-1.5 text-fg-3 hover:text-crimson-500 hover:bg-crimson-50 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed justify-self-end"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end items-baseline gap-3 mt-3 px-2">
              <span className="text-sm text-fg-2">Total</span>
              <span className="vps-money text-xl font-bold">{formatNpr(total)}</span>
            </div>
          </div>

          <Textarea
            label="Notes"
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            placeholder="Delivery note number, freight, payment terms…"
          />
        </form>
      </Modal>
    </div>
  );
}
