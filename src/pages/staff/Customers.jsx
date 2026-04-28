import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Users, ChevronRight, Trash2 } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input, SearchInput, Textarea } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Table, THead, TBody, Tr, Th, Td } from '../../components/ui/Table';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { LoyaltyPill } from '../../components/ui/Pill';
import Avatar from '../../components/ui/Avatar';
import { customers as customersApi } from '../../api/endpoints';
import { formatNpr, formatPhone, formatVehicleNumber } from '../../lib/format';

const blankCustomer = {
  fullName: '',
  email: '',
  phoneNumber: '+977 ',
  password: '',
  address: '',
};

const blankVehicle = {
  vehicleNumber: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  color: '',
  mileage: 0,
};

export default function StaffCustomers() {
  const [items, setItems] = useState(null);
  const [query, setQuery] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [registering, setRegistering] = useState(false);
  const [draft, setDraft] = useState({ ...blankCustomer, vehicles: [] });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setItems(null);
    customersApi
      .search(query || undefined, vehicleNumber || undefined)
      .then(setItems)
      .catch(() => toast.error('Could not load customers'));
  };

  useEffect(() => { load(); }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [query, vehicleNumber]);

  const updateVehicle = (i, k, v) => {
    const next = [...draft.vehicles];
    next[i] = { ...next[i], [k]: k === 'vehicleNumber' ? formatVehicleNumber(v) : v };
    setDraft({ ...draft, vehicles: next });
  };

  const submit = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        fullName: draft.fullName,
        email: draft.email,
        phoneNumber: draft.phoneNumber.replace(/\s+/g, ''),
        password: draft.password,
        address: draft.address,
        vehicles: draft.vehicles.length ? draft.vehicles.map((v) => ({ ...v, year: Number(v.year) || 0, mileage: Number(v.mileage) || 0 })) : null,
      };
      await customersApi.create(payload);
      toast.success(`${payload.fullName} registered`);
      setRegistering(false);
      setDraft({ ...blankCustomer, vehicles: [] });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not register');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Search by name, phone, email, or vehicle number — or register a new walk-in."
        actions={
          <Button onClick={() => { setDraft({ ...blankCustomer, vehicles: [] }); setRegistering(true); }}>
            <Plus />Register customer
          </Button>
        }
      />

      <Card className="mb-3.5">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <SearchInput
            placeholder="Name, phone, email, or ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <SearchInput
            placeholder="Vehicle number — BA 12 PA 3456"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(formatVehicleNumber(e.target.value))}
          />
        </div>
      </Card>

      <Card>
        <Table>
          <THead>
            <Th>Customer</Th>
            <Th>Phone</Th>
            <Th align="right">Vehicles</Th>
            <Th align="right">Visits</Th>
            <Th align="right">Total spent</Th>
            <Th align="right">Pending</Th>
            <Th />
          </THead>
          <TBody empty="No customers match. Try a different search or register a new walk-in.">
            {items === null
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              : items.length === 0
                ? null
                : items.map((c) => {
                    const isRegular = false; // backend doesn't return invoiceCount on summary; show loyalty when totalSpent > 0
                    return (
                      <Tr key={c.id}>
                        <Td>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={c.fullName} size={32} />
                            <div>
                              <div className="font-semibold flex items-center gap-2">
                                {c.fullName}
                                {c.totalSpent > 5000 && <LoyaltyPill>★ Regular</LoyaltyPill>}
                              </div>
                              <div className="text-xs text-fg-3">{c.email}</div>
                            </div>
                          </div>
                        </Td>
                        <Td mono className="text-xs">{formatPhone(c.phoneNumber)}</Td>
                        <Td align="right" mono>{c.vehicleCount}</Td>
                        <Td align="right" mono>—</Td>
                        <Td align="right" mono className="font-semibold">{formatNpr(c.totalSpent)}</Td>
                        <Td align="right" mono className={c.pendingCredit > 0 ? 'text-crimson-700 font-bold' : 'text-fg-3'}>
                          {formatNpr(c.pendingCredit)}
                        </Td>
                        <Td align="right">
                          <Link
                            to={`/staff/customers/${c.id}`}
                            className="inline-flex items-center gap-1 text-sm text-primary-700 hover:underline font-semibold"
                          >
                            View<ChevronRight className="w-3 h-3" />
                          </Link>
                        </Td>
                      </Tr>
                    );
                  })}
          </TBody>
        </Table>

        {items?.length === 0 && (
          <EmptyState
            icon={Users}
            title="No customers yet"
            body="Register a walk-in to get started — capture their phone and at least one vehicle."
            action={<Button onClick={() => setRegistering(true)}><Plus />Register customer</Button>}
          />
        )}
      </Card>

      <Modal
        open={registering}
        onClose={() => setRegistering(false)}
        title="Register a customer"
        subtitle="Capture contact details and any vehicles they bring in."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRegistering(false)}>Cancel</Button>
            <Button onClick={submit} disabled={submitting}>
              <Plus />{submitting ? 'Registering…' : 'Register customer'}
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Full name" required value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} placeholder="Hari Sharma" />
            <Input label="Email" type="email" required value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="hari@example.com" />
            <Input label="Phone" mono required value={draft.phoneNumber} onChange={(e) => setDraft({ ...draft, phoneNumber: e.target.value })} placeholder="+977 9XXXXXXXXX" />
            <Input label="Initial password" type="password" required value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} hint="Share with the customer; they can change it later." />
            <div className="col-span-2">
              <Textarea label="Address" value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} placeholder="Bagmati Province, Lalitpur — Patan-7" rows={2} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="vps-label">Vehicles ({draft.vehicles.length})</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setDraft({ ...draft, vehicles: [...draft.vehicles, { ...blankVehicle }] })}
              >
                <Plus />Add vehicle
              </Button>
            </div>

            {draft.vehicles.length === 0 && (
              <p className="text-xs text-fg-3 px-1">Optional — you can also add vehicles later from the customer's detail page.</p>
            )}

            {draft.vehicles.map((v, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 mt-3 p-3 bg-bg-subtle rounded-md">
                <div className="col-span-2 flex justify-between items-center">
                  <span className="vps-caption">Vehicle {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, vehicles: draft.vehicles.filter((_, idx) => idx !== i) })}
                    className="text-xs text-crimson-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />Remove
                  </button>
                </div>
                <Input
                  label="Vehicle number"
                  mono
                  required
                  value={v.vehicleNumber}
                  onChange={(e) => updateVehicle(i, 'vehicleNumber', e.target.value)}
                  placeholder="BA 12 PA 3456"
                />
                <Input
                  label="Year"
                  type="number"
                  required
                  mono
                  min="1950"
                  max={new Date().getFullYear() + 1}
                  value={v.year}
                  onChange={(e) => updateVehicle(i, 'year', e.target.value)}
                />
                <Input label="Make" required value={v.make} onChange={(e) => updateVehicle(i, 'make', e.target.value)} placeholder="Honda" />
                <Input label="Model" required value={v.model} onChange={(e) => updateVehicle(i, 'model', e.target.value)} placeholder="Civic" />
                <Input label="Colour" value={v.color} onChange={(e) => updateVehicle(i, 'color', e.target.value)} placeholder="Pearl White" />
                <Input
                  label="Mileage (km)"
                  mono
                  type="number"
                  min="0"
                  value={v.mileage}
                  onChange={(e) => updateVehicle(i, 'mileage', e.target.value)}
                />
              </div>
            ))}
          </div>
        </form>
      </Modal>
    </div>
  );
}
