import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Key, Users } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import Modal, { ConfirmModal } from '../../components/ui/Modal';
import { Table, THead, TBody, Tr, Th, Td } from '../../components/ui/Table';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Pill from '../../components/ui/Pill';
import Avatar from '../../components/ui/Avatar';
import { staff as staffApi } from '../../api/endpoints';
import { formatPhone, formatDate } from '../../lib/format';

const blank = {
  fullName: '', email: '', phoneNumber: '+977 ', password: '', address: '', isActive: true,
};

export default function AdminStaff() {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [resetting, setResetting] = useState(null);
  const [newPw, setNewPw] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deactivating, setDeactivating] = useState(null);

  const load = () => {
    setItems(null);
    staffApi.list().then(setItems).catch(() => toast.error('Could not load staff'));
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
        await staffApi.create(payload);
        toast.success(`${payload.fullName} added`);
      } else {
        await staffApi.update(editing.id, {
          fullName: payload.fullName,
          phoneNumber: payload.phoneNumber,
          address: payload.address,
          isActive: payload.isActive,
        });
        toast.success(`${payload.fullName} updated`);
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetPw = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await staffApi.resetPassword(resetting.id, newPw);
      toast.success(`Password reset for ${resetting.fullName}`);
      setResetting(null);
      setNewPw('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const deactivate = async () => {
    if (!deactivating) return;
    setSubmitting(true);
    try {
      await staffApi.remove(deactivating.id);
      toast.success(`${deactivating.fullName} deactivated`);
      setDeactivating(null);
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
        title="Staff"
        subtitle="Counter clerks who can sell parts and serve customers."
        actions={
          <Button onClick={() => { setForm(blank); setEditing('new'); }}>
            <Plus />Add staff
          </Button>
        }
      />

      <Card>
        <Table>
          <THead>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Phone</Th>
            <Th>Status</Th>
            <Th>Joined</Th>
            <Th />
          </THead>
          <TBody empty="No staff accounts yet">
            {items === null
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              : items.length === 0
                ? null
                : items.map((s) => (
                    <Tr key={s.id}>
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={s.fullName} size={32} />
                          <span className="font-semibold">{s.fullName}</span>
                        </div>
                      </Td>
                      <Td className="text-sm">{s.email}</Td>
                      <Td mono className="text-xs">{formatPhone(s.phoneNumber)}</Td>
                      <Td>
                        {s.isActive
                          ? <Pill variant="paid">Active</Pill>
                          : <Pill variant="cancelled">Deactivated</Pill>}
                      </Td>
                      <Td className="text-xs text-fg-3">{formatDate(s.createdAt)}</Td>
                      <Td align="right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => { setEditing(s); setForm({ ...blank, ...s, phoneNumber: s.phoneNumber || '+977 ', password: '' }); }}
                            className="p-1.5 rounded-sm text-fg-3 hover:bg-bg-subtle hover:text-fg-1"
                            aria-label="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { setResetting(s); setNewPw(''); }}
                            className="p-1.5 rounded-sm text-fg-3 hover:bg-bg-subtle hover:text-fg-1"
                            aria-label="Reset password"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          {s.isActive && (
                            <button
                              onClick={() => setDeactivating(s)}
                              className="p-1.5 rounded-sm text-fg-3 hover:bg-crimson-50 hover:text-crimson-600"
                              aria-label="Deactivate"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))}
          </TBody>
        </Table>

        {items?.length === 0 && (
          <EmptyState
            icon={Users}
            title="No staff yet"
            body="Add a counter clerk so they can sign in, register customers, and create sales invoices."
            action={<Button onClick={() => { setForm(blank); setEditing('new'); }}><Plus />Add staff</Button>}
          />
        )}
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add staff member' : `Edit ${editing?.fullName}`}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? 'Saving…' : editing === 'new' ? 'Add staff' : 'Save changes'}
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Input label="Full name" required value={form.fullName} onChange={update('fullName')} placeholder="Sita Thapa" />
          <Input
            label="Email"
            type="email"
            required
            disabled={editing !== 'new'}
            value={form.email}
            onChange={update('email')}
            placeholder="sita@vps.local"
          />
          <Input label="Phone" mono required value={form.phoneNumber} onChange={update('phoneNumber')} placeholder="+977 9XXXXXXXXX" />
          {editing === 'new' && (
            <Input
              label="Initial password"
              type="password"
              required
              value={form.password}
              onChange={update('password')}
              placeholder="Will be reset on first sign-in"
              hint="Share with the staff member out-of-band; they should change it after signing in."
            />
          )}
          <Textarea label="Address" value={form.address} onChange={update('address')} rows={2} />
          {editing !== 'new' && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={update('isActive')}
                className="w-4 h-4 accent-primary-500"
              />
              Account active
            </label>
          )}
        </form>
      </Modal>

      <Modal
        open={!!resetting}
        onClose={() => setResetting(null)}
        title={`Reset password for ${resetting?.fullName}`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetting(null)}>Cancel</Button>
            <Button onClick={resetPw} disabled={submitting || newPw.length < 6}>
              {submitting ? 'Resetting…' : 'Reset password'}
            </Button>
          </>
        }
      >
        <form onSubmit={resetPw} className="flex flex-col gap-3">
          <Input
            label="New password"
            type="password"
            required
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            hint="At least 6 characters. Share with the user out-of-band."
            placeholder="••••••••"
          />
        </form>
      </Modal>

      <ConfirmModal
        open={!!deactivating}
        onClose={() => setDeactivating(null)}
        title={`Deactivate ${deactivating?.fullName}?`}
        body="They can no longer sign in. You can reactivate later by editing the account."
        confirmLabel="Deactivate"
        danger
        busy={submitting}
        onConfirm={deactivate}
      />
    </div>
  );
}
