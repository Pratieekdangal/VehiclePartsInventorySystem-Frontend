import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Truck } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import Modal, { ConfirmModal } from '../../components/ui/Modal';
import { Table, THead, TBody, Tr, Th, Td } from '../../components/ui/Table';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Pill from '../../components/ui/Pill';
import { vendors as vendorsApi } from '../../api/endpoints';
import { formatPhone, formatDate } from '../../lib/format';

const blank = {
  name: '', contactPerson: '', email: '', phoneNumber: '+977 ',
  address: '', isActive: true,
};

export default function AdminVendors() {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setItems(null);
    vendorsApi.list().then(setItems).catch(() => toast.error('Could not load vendors'));
  };

  useEffect(() => { load(); }, []);

  const update = (k) => (e) =>
    setForm({ ...form, [k]: e.target?.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, phoneNumber: form.phoneNumber.replace(/\s+/g, '') };
      if (editing === 'new') {
        await vendorsApi.create(payload);
        toast.success(`${payload.name} added`);
      } else {
        await vendorsApi.update(editing.id, payload);
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
      await vendorsApi.remove(deleteTarget.id);
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle="Suppliers you record purchase invoices against."
        actions={
          <Button onClick={() => { setForm(blank); setEditing('new'); }}>
            <Plus />Add vendor
          </Button>
        }
      />

      <Card>
        <Table>
          <THead>
            <Th>Name</Th>
            <Th>Contact</Th>
            <Th>Phone</Th>
            <Th>Address</Th>
            <Th>Status</Th>
            <Th>Added</Th>
            <Th />
          </THead>
          <TBody empty="No vendors yet">
            {items === null
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              : items.length === 0
                ? null
                : items.map((v) => (
                    <Tr key={v.id}>
                      <Td>
                        <div className="font-semibold">{v.name}</div>
                        <div className="text-xs text-fg-3">{v.email}</div>
                      </Td>
                      <Td className="text-sm">{v.contactPerson || '—'}</Td>
                      <Td mono className="text-xs">{formatPhone(v.phoneNumber)}</Td>
                      <Td className="text-sm text-fg-2 max-w-[240px] truncate">{v.address || '—'}</Td>
                      <Td>
                        {v.isActive
                          ? <Pill variant="paid">Active</Pill>
                          : <Pill variant="cancelled">Inactive</Pill>}
                      </Td>
                      <Td className="text-xs text-fg-3">{formatDate(v.createdAt)}</Td>
                      <Td align="right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => { setEditing(v); setForm({ ...blank, ...v, phoneNumber: v.phoneNumber || '+977 ' }); }}
                            className="p-1.5 rounded-sm text-fg-3 hover:bg-bg-subtle hover:text-fg-1"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(v)}
                            className="p-1.5 rounded-sm text-fg-3 hover:bg-crimson-50 hover:text-crimson-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
          </TBody>
        </Table>

        {items?.length === 0 && (
          <EmptyState
            icon={Truck}
            title="No vendors yet"
            body="Add the suppliers you buy parts from so purchase invoices can be tracked."
            action={<Button onClick={() => { setForm(blank); setEditing('new'); }}><Plus />Add vendor</Button>}
          />
        )}
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add vendor' : `Edit ${editing?.name}`}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? 'Saving…' : editing === 'new' ? 'Add vendor' : 'Save changes'}
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <Input
            label="Vendor name"
            required
            value={form.name}
            onChange={update('name')}
            placeholder="Sharma Auto Suppliers"
            className="col-span-2"
          />
          <Input
            label="Contact person"
            value={form.contactPerson}
            onChange={update('contactPerson')}
            placeholder="e.g. Krishna Sharma"
          />
          <Input
            type="email"
            label="Email"
            required
            value={form.email}
            onChange={update('email')}
            placeholder="orders@sharma.com.np"
          />
          <Input
            label="Phone"
            mono
            required
            value={form.phoneNumber}
            onChange={update('phoneNumber')}
            placeholder="+977 9XXXXXXXXX"
          />
          <div />
          <div className="col-span-2">
            <Textarea
              label="Address"
              value={form.address}
              onChange={update('address')}
              placeholder="Bagmati Province, Lalitpur — Patan Industrial Estate, Block 4"
              rows={2}
            />
          </div>
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={update('isActive')}
              className="w-4 h-4 accent-primary-500"
            />
            Active vendor
          </label>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name}?`}
        body="Their purchase history will be unlinked. Parts associated with this vendor stay in your catalogue."
        confirmLabel="Delete vendor"
        danger
        busy={submitting}
        onConfirm={remove}
      />
    </div>
  );
}
