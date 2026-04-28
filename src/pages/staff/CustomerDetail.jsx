import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Receipt, ShoppingCart, Car } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { Card, CardHead } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Table, THead, TBody, Tr, Th, Td } from '../../components/ui/Table';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { StatusPill, LoyaltyPill } from '../../components/ui/Pill';
import Avatar from '../../components/ui/Avatar';
import { customers as customersApi, sales as salesApi } from '../../api/endpoints';
import { formatNpr, formatPhone, formatDate, formatVehicleNumber } from '../../lib/format';
import Skeleton from '../../components/ui/Skeleton';

export default function StaffCustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [invoices, setInvoices] = useState(null);
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [vehicleDraft, setVehicleDraft] = useState({
    vehicleNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    mileage: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setCustomer(null);
    setInvoices(null);
    customersApi.get(id).then(setCustomer).catch(() => toast.error('Could not load customer'));
    salesApi.byCustomer(id).then(setInvoices).catch(() => setInvoices([]));
  };

  useEffect(() => { load(); }, [id]);

  const submit = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      await customersApi.addVehicle(id, {
        ...vehicleDraft,
        year: Number(vehicleDraft.year) || 0,
        mileage: Number(vehicleDraft.mileage) || 0,
      });
      toast.success(`${vehicleDraft.vehicleNumber} added`);
      setAddingVehicle(false);
      setVehicleDraft({
        vehicleNumber: '', make: '', model: '',
        year: new Date().getFullYear(), color: '', mileage: 0,
      });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!customer) {
    return (
      <div>
        <Skeleton className="h-8 w-72 mb-6" />
        <div className="grid grid-cols-3 gap-3.5 mb-5">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  const isRegular = customer.invoiceCount >= 3;

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-fg-3 hover:text-fg-1 mb-3"
      >
        <ArrowLeft className="w-3.5 h-3.5" />Back
      </button>

      <Card className="mb-3.5">
        <div className="p-5 flex items-start gap-4 flex-wrap">
          <Avatar name={customer.fullName} size={56} className="text-base" />
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="vps-h1">{customer.fullName}</h1>
              {isRegular && <LoyaltyPill>★ Regular · {customer.invoiceCount} visits</LoyaltyPill>}
            </div>
            <div className="text-sm text-fg-2">
              <span>{customer.email}</span>
              <span className="mx-2 text-fg-3">·</span>
              <span className="font-mono">{formatPhone(customer.phoneNumber)}</span>
            </div>
            {customer.address && (
              <div className="text-xs text-fg-3 mt-1">{customer.address}</div>
            )}
          </div>
          <Button as={Link} to="/staff/new-sale">
            <ShoppingCart />Start a sale
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
        <StatCard
          label="Total spent"
          value={formatNpr(customer.totalSpent)}
          delta={`${customer.invoiceCount} invoices`}
          deltaTone="up"
        />
        <StatCard
          label="Pending credit"
          value={formatNpr(customer.pendingCredit)}
          delta={customer.pendingCredit > 0 ? 'Follow up needed' : 'All settled'}
          deltaTone={customer.pendingCredit > 0 ? 'down' : 'up'}
          alert={customer.pendingCredit > 0}
        />
        <StatCard
          label="Vehicles on file"
          value={customer.vehicles?.length ?? 0}
          delta="Added at registration"
          deltaTone="neutral"
        />
      </div>

      <Card className="mb-3.5">
        <CardHead
          title="Vehicles"
          meta={customer.vehicles?.length ? `${customer.vehicles.length} on file` : null}
          action={
            <Button size="sm" onClick={() => setAddingVehicle(true)}>
              <Plus />Add vehicle
            </Button>
          }
        />
        {customer.vehicles?.length === 0 ? (
          <EmptyState
            icon={Car}
            title="No vehicles registered"
            body="Add the customer's vehicle so future sales can be linked to it."
            action={<Button onClick={() => setAddingVehicle(true)}><Plus />Add vehicle</Button>}
          />
        ) : (
          <Table>
            <THead>
              <Th>Vehicle number</Th>
              <Th>Make · Model</Th>
              <Th align="right">Year</Th>
              <Th align="right">Mileage</Th>
              <Th>Last service</Th>
            </THead>
            <TBody>
              {(customer.vehicles || []).map((v) => (
                <Tr key={v.id}>
                  <Td mono className="font-bold">{v.vehicleNumber}</Td>
                  <Td>{v.make} {v.model}</Td>
                  <Td align="right" mono>{v.year}</Td>
                  <Td align="right" mono>{v.mileage} km</Td>
                  <Td className="text-sm">{formatDate(v.lastServiceDate)}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHead title="Purchase history" meta={invoices?.length ? `${invoices.length} invoices` : null} />
        <Table>
          <THead>
            <Th>Invoice</Th>
            <Th>Date</Th>
            <Th>Items</Th>
            <Th align="right">Total</Th>
            <Th align="right">Balance due</Th>
            <Th>Status</Th>
          </THead>
          <TBody empty="No invoices yet for this customer.">
            {invoices === null
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              : invoices.length === 0
                ? null
                : invoices.map((inv) => (
                    <Tr key={inv.id}>
                      <Td mono className="text-xs">{inv.invoiceNumber}</Td>
                      <Td className="text-sm">{formatDate(inv.invoiceDate)}</Td>
                      <Td className="text-sm">
                        {(inv.items || []).slice(0, 2).map((it) => it.partName).join(', ')}
                        {inv.items?.length > 2 && <span className="text-fg-3"> +{inv.items.length - 2} more</span>}
                      </Td>
                      <Td align="right" mono className="font-bold">{formatNpr(inv.totalAmount)}</Td>
                      <Td align="right" mono className={inv.balanceDue > 0 ? 'text-crimson-700 font-bold' : 'text-fg-3'}>
                        {formatNpr(inv.balanceDue)}
                      </Td>
                      <Td><StatusPill status={inv.paymentStatus} /></Td>
                    </Tr>
                  ))}
          </TBody>
        </Table>
      </Card>

      <Modal
        open={addingVehicle}
        onClose={() => setAddingVehicle(false)}
        title="Add a vehicle"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddingVehicle(false)}>Cancel</Button>
            <Button onClick={submit} disabled={submitting}>
              <Plus />{submitting ? 'Adding…' : 'Add vehicle'}
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <Input
            label="Vehicle number"
            mono
            required
            value={vehicleDraft.vehicleNumber}
            onChange={(e) => setVehicleDraft({ ...vehicleDraft, vehicleNumber: formatVehicleNumber(e.target.value) })}
            placeholder="BA 12 PA 3456"
            className="col-span-2"
          />
          <Input label="Make" required value={vehicleDraft.make} onChange={(e) => setVehicleDraft({ ...vehicleDraft, make: e.target.value })} placeholder="Honda" />
          <Input label="Model" required value={vehicleDraft.model} onChange={(e) => setVehicleDraft({ ...vehicleDraft, model: e.target.value })} placeholder="Civic" />
          <Input
            label="Year"
            type="number"
            required
            mono
            min="1950"
            max={new Date().getFullYear() + 1}
            value={vehicleDraft.year}
            onChange={(e) => setVehicleDraft({ ...vehicleDraft, year: e.target.value })}
          />
          <Input label="Colour" value={vehicleDraft.color} onChange={(e) => setVehicleDraft({ ...vehicleDraft, color: e.target.value })} />
          <Input
            label="Mileage (km)"
            mono
            type="number"
            min="0"
            value={vehicleDraft.mileage}
            onChange={(e) => setVehicleDraft({ ...vehicleDraft, mileage: e.target.value })}
            className="col-span-2"
          />
        </form>
      </Modal>
    </div>
  );
}
