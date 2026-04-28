import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Package, Printer } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input, Select, Textarea, SearchInput, Field } from '../../components/ui/Input';
import Modal, { ConfirmModal } from '../../components/ui/Modal';
import { Table, THead, TBody, Tr, Th, Td } from '../../components/ui/Table';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { parts as partsApi, vendors as vendorsApi } from '../../api/endpoints';
import { formatNpr } from '../../lib/format';
import { cn } from '../../lib/cn';

const blankPart = {
  partCode: '', name: '', category: 'Brakes', description: '',
  purchasePrice: 0, sellingPrice: 0,
  stockQuantity: 0, lowStockThreshold: 10,
  compatibleMake: '', compatibleModel: '',
  vendorId: '', isActive: true,
};

const CATEGORIES = ['Brakes', 'Lubricants', 'Filters', 'Battery', 'Wipers', 'Electricals', 'Tyres', 'Other'];

export default function AdminParts() {
  const [items, setItems] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [editing, setEditing] = useState(null); // null | 'new' | partObject
  const [form, setForm] = useState(blankPart);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setItems(null);
    partsApi
      .list({ search: search || undefined, category: category || undefined, lowStockOnly: lowOnly || undefined })
      .then(setItems)
      .catch(() => toast.error('Could not load parts'));
  };

  useEffect(() => { load(); }, [search, category, lowOnly]);
  useEffect(() => { vendorsApi.list().then(setVendors).catch(() => {}); }, []);

  const openNew = () => { setForm(blankPart); setEditing('new'); };
  const openEdit = (p) => {
    setForm({ ...blankPart, ...p, vendorId: p.vendorId || '' });
    setEditing(p);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        purchasePrice: Number(form.purchasePrice) || 0,
        sellingPrice: Number(form.sellingPrice) || 0,
        stockQuantity: Number(form.stockQuantity) || 0,
        lowStockThreshold: Number(form.lowStockThreshold) || 10,
        vendorId: form.vendorId || null,
      };
      if (editing === 'new') {
        await partsApi.create(payload);
        toast.success(`${payload.name} added`);
      } else {
        await partsApi.update(editing.id, payload);
        toast.success(`${payload.name} updated`);
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await partsApi.remove(deleteTarget.id);
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  const update = (k) => (e) =>
    setForm({ ...form, [k]: e.target?.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <div>
      <PageHeader
        title="Parts inventory"
        subtitle="All catalogue items, stock levels, and pricing."
        actions={
          <>
            <Button variant="secondary"><Printer />Export</Button>
            <Button onClick={openNew}><Plus />Add part</Button>
          </>
        }
      />

      <Card className="mb-3.5">
        <div className="p-4 flex flex-wrap gap-2.5 items-center">
          <SearchInput
            placeholder="Search by name or part code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[240px] max-w-sm"
          />
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="max-w-[180px]"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <label className="flex items-center gap-2 text-sm font-medium ml-auto cursor-pointer">
            <input
              type="checkbox"
              checked={lowOnly}
              onChange={(e) => setLowOnly(e.target.checked)}
              className="w-4 h-4 accent-crimson-500"
            />
            Low stock only
          </label>
        </div>
      </Card>

      <Card>
        <Table>
          <THead>
            <Th>Code</Th>
            <Th>Part</Th>
            <Th>Category</Th>
            <Th align="right">Stock</Th>
            <Th align="right">Selling price</Th>
            <Th>Vendor</Th>
            <Th />
          </THead>
          <TBody empty="No parts match. Try clearing filters or add a new part.">
            {items === null
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              : items.length === 0
                ? null
                : items.map((p) => {
                    const low = p.stockQuantity <= p.lowStockThreshold;
                    return (
                      <Tr key={p.id}>
                        <Td mono className="text-xs">{p.partCode}</Td>
                        <Td>
                          <div className="font-semibold text-sm">{p.name}</div>
                          {(p.compatibleMake || p.compatibleModel) && (
                            <div className="text-xs text-fg-3">
                              {[p.compatibleMake, p.compatibleModel].filter(Boolean).join(' · ')}
                            </div>
                          )}
                        </Td>
                        <Td>
                          <span className="inline-block px-2 py-0.5 rounded-xs bg-bg-subtle text-fg-2 text-xs font-semibold">
                            {p.category}
                          </span>
                        </Td>
                        <Td align="right">
                          <span className={cn(
                            'font-mono',
                            low ? 'text-crimson-700 font-bold' : 'text-fg-1 font-medium',
                          )}>
                            {p.stockQuantity}
                          </span>
                          <span className="font-mono text-fg-3 text-xs"> / {p.lowStockThreshold}</span>
                        </Td>
                        <Td align="right" mono>{formatNpr(p.sellingPrice)}</Td>
                        <Td className="text-xs text-fg-2">{p.vendorName || '—'}</Td>
                        <Td align="right">
                          <div className="inline-flex gap-1">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-1.5 rounded-sm text-fg-3 hover:bg-bg-subtle hover:text-fg-1"
                              aria-label="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(p)}
                              className="p-1.5 rounded-sm text-fg-3 hover:bg-crimson-50 hover:text-crimson-600"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </Td>
                      </Tr>
                    );
                  })}
          </TBody>
        </Table>
        {items?.length === 0 && (
          <EmptyState
            icon={Package}
            title="No parts in catalogue yet"
            body="Add your first part to start tracking stock and selling at the counter."
            action={<Button onClick={openNew}><Plus />Add part</Button>}
          />
        )}
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add new part' : `Edit ${editing?.name || 'part'}`}
        subtitle="Part code is permanent — pick one that matches your shelf labels."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={submit} disabled={submitting}>
              <Plus />{submitting ? 'Saving…' : editing === 'new' ? 'Create part' : 'Save changes'}
            </Button>
          </>
        }
      >
        <form className="grid grid-cols-2 gap-3" onSubmit={submit}>
          <Input
            label="Part code"
            required
            mono
            disabled={editing !== 'new'}
            value={form.partCode}
            onChange={update('partCode')}
            placeholder="PRT-XXX-NN"
            className="col-span-1"
          />
          <Select label="Category" value={form.category} onChange={update('category')} className="col-span-1">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Input
            label="Part name"
            required
            value={form.name}
            onChange={update('name')}
            placeholder="e.g. Brake pad set"
            className="col-span-2"
          />
          <Input
            label="Compatible make"
            value={form.compatibleMake}
            onChange={update('compatibleMake')}
            placeholder="Honda, Toyota, Universal…"
          />
          <Input
            label="Compatible model"
            value={form.compatibleModel}
            onChange={update('compatibleModel')}
            placeholder="Civic 2018-22"
          />
          <Input
            type="number" min="0" step="0.01"
            label="Cost price (Rs.)"
            mono
            value={form.purchasePrice}
            onChange={update('purchasePrice')}
          />
          <Input
            type="number" min="0" step="0.01"
            label="Selling price (Rs.)"
            mono
            value={form.sellingPrice}
            onChange={update('sellingPrice')}
          />
          <Input
            type="number" min="0"
            label="Stock quantity"
            mono
            value={form.stockQuantity}
            onChange={update('stockQuantity')}
          />
          <Input
            type="number" min="0"
            label="Low-stock threshold"
            mono
            value={form.lowStockThreshold}
            onChange={update('lowStockThreshold')}
          />
          <Select label="Default vendor" value={form.vendorId} onChange={update('vendorId')} className="col-span-2">
            <option value="">— None —</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </Select>
          <div className="col-span-2">
            <Textarea
              label="Description"
              value={form.description || ''}
              onChange={update('description')}
              rows={2}
            />
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name}?`}
        body={`This will permanently remove the part and its purchase history reference. Sales already recorded will keep working.`}
        confirmLabel="Delete part"
        danger
        busy={submitting}
        onConfirm={remove}
      />
    </div>
  );
}
