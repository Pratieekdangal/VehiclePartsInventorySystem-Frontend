import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Receipt, Trash2, Search, Plus, Package, User2, Car } from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import { Card, CardHead, CardBody } from '../../components/ui/Card';
import { Input, Select, SearchInput, Textarea, Field } from '../../components/ui/Input';
import { LoyaltyPill } from '../../components/ui/Pill';
import Avatar from '../../components/ui/Avatar';
import LoyaltyCard, { LoyaltyHint } from '../../components/ui/LoyaltyCard';
import EmptyState from '../../components/ui/EmptyState';

import { customers, parts as partsApi, sales as salesApi } from '../../api/endpoints';
import { useCart, cartTotals, cartLoyalty } from '../../store/cart';
import { formatNpr, formatPhone } from '../../lib/format';
import { cn } from '../../lib/cn';

export default function NewSale() {
  const navigate = useNavigate();
  const cart = useCart();

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [customerVehicles, setCustomerVehicles] = useState([]);

  const [partSearch, setPartSearch] = useState('');
  const [partsCatalog, setPartsCatalog] = useState([]);

  const [submitting, setSubmitting] = useState(false);

  // Derived totals — single source of truth for the loyalty moment & summary.
  const totals = useMemo(() => cartTotals(cart), [cart]);
  const loyalty = useMemo(() => cartLoyalty(cart), [cart]);

  // Reset when navigating away on successful create.
  useEffect(() => () => undefined, []);

  // Customer search — debounced lightly via search-on-change for now.
  useEffect(() => {
    let active = true;
    const t = setTimeout(() => {
      customers
        .search(customerSearch || undefined)
        .then((rows) => active && setCustomerResults(rows.slice(0, 6)))
        .catch(() => {});
    }, 200);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [customerSearch]);

  // Parts catalog (filtered).
  useEffect(() => {
    let active = true;
    const t = setTimeout(() => {
      partsApi
        .list({ search: partSearch || undefined })
        .then((rows) => active && setPartsCatalog(rows.filter((p) => p.isActive)))
        .catch(() => {});
    }, 150);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [partSearch]);

  // Vehicle list for the picked customer.
  useEffect(() => {
    if (!cart.customer?.id) {
      setCustomerVehicles([]);
      return;
    }
    customers
      .vehicles(cart.customer.id)
      .then(setCustomerVehicles)
      .catch(() => setCustomerVehicles([]));
  }, [cart.customer?.id]);

  const onCreate = async () => {
    if (!cart.customer || cart.lines.length === 0) {
      toast.error('Add a customer and at least one part');
      return;
    }
    setSubmitting(true);
    try {
      const data = await salesApi.create({
        customerId: cart.customer.id,
        vehicleId: cart.vehicle?.id || null,
        amountPaid: Number(cart.amountPaid) || 0,
        dueDate: cart.dueDate || null,
        notes: cart.notes || null,
        items: cart.lines.map((l) => ({ partId: l.partId, quantity: l.quantity })),
      });
      toast.success(`Invoice ${data.invoiceNumber} created`);
      cart.reset();
      navigate('/staff');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="New sale"
        subtitle="Build the invoice, watch loyalty unlock at Rs. 5,001."
        actions={
          <>
            <Button variant="secondary" onClick={() => cart.reset()}>
              Clear
            </Button>
            <Button onClick={onCreate} disabled={submitting}>
              <Receipt />
              {submitting ? 'Creating…' : 'Create & email invoice'}
            </Button>
          </>
        }
      />

      <div className="grid lg:grid-cols-[1fr_380px] gap-3.5 items-start">
        {/* ---------- Left column: customer + lines + add parts ---------- */}
        <div className="flex flex-col gap-3.5 min-w-0">
          <CustomerVehicleCard
            customer={cart.customer}
            vehicle={cart.vehicle}
            vehicles={customerVehicles}
            onCustomerCleared={() => cart.setCustomer(null)}
            onVehicleChange={(v) => cart.setVehicle(v)}
            customerSearch={customerSearch}
            setCustomerSearch={setCustomerSearch}
            customerResults={customerResults}
            onCustomerPicked={(c) => {
              cart.setCustomer(c);
              setCustomerSearch('');
            }}
          />

          <LineItemsCard cart={cart} />

          <AddPartsCard
            search={partSearch}
            setSearch={setPartSearch}
            parts={partsCatalog}
            onPick={(p) => cart.addPart(p)}
          />
        </div>

        {/* ---------- Right column: sticky summary ---------- */}
        <div className="lg:sticky lg:top-20 self-start">
          <SummaryCard
            cart={cart}
            totals={totals}
            loyalty={loyalty}
            submitting={submitting}
            onCreate={onCreate}
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Customer + vehicle picker                                                 */
/* -------------------------------------------------------------------------- */

function CustomerVehicleCard({
  customer,
  vehicle,
  vehicles,
  onCustomerCleared,
  onVehicleChange,
  customerSearch,
  setCustomerSearch,
  customerResults,
  onCustomerPicked,
}) {
  return (
    <Card>
      <CardHead title="Customer & vehicle" />
      <CardBody className="grid sm:grid-cols-2 gap-3">
        {customer ? (
          <Field label="Customer">
            <div className="flex items-center gap-2.5 px-3 py-2 border border-border-strong rounded-sm">
              <Avatar name={customer.fullName} size={32} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{customer.fullName}</div>
                <div className="font-mono text-[11px] text-fg-3">
                  {formatPhone(customer.phoneNumber)}
                </div>
              </div>
              {customer.invoiceCount >= 3 && (
                <LoyaltyPill>Regular · {customer.invoiceCount} visits</LoyaltyPill>
              )}
              <button
                onClick={onCustomerCleared}
                className="text-xs text-fg-3 hover:text-crimson-500 ml-2"
              >
                Change
              </button>
            </div>
          </Field>
        ) : (
          <Field label="Customer">
            <div className="relative">
              <SearchInput
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search by name, phone, or vehicle number…"
              />
              {customerSearch && customerResults.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-surface border border-border rounded-sm shadow-md max-h-72 overflow-y-auto">
                  {customerResults.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onCustomerPicked(c)}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-bg-subtle border-b border-border last:border-0"
                    >
                      <Avatar name={c.fullName} size={28} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{c.fullName}</div>
                        <div className="font-mono text-[11px] text-fg-3">
                          {formatPhone(c.phoneNumber)}
                        </div>
                      </div>
                      {c.invoiceCount >= 3 && <LoyaltyPill>★ Regular</LoyaltyPill>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>
        )}

        <Field label="Vehicle">
          {!customer ? (
            <div className="text-sm text-fg-3 px-3 py-2 border border-dashed border-border rounded-sm">
              Select a customer first
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-sm text-fg-3 px-3 py-2 border border-dashed border-border rounded-sm">
              No vehicles on file
            </div>
          ) : (
            <Select
              value={vehicle?.id || ''}
              onChange={(e) => {
                const v = vehicles.find((x) => x.id === e.target.value);
                onVehicleChange(v || null);
              }}
            >
              <option value="">— None —</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicleNumber} — {v.make} {v.model} {v.year}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </CardBody>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Line items grid                                                           */
/* -------------------------------------------------------------------------- */

function LineItemsCard({ cart }) {
  if (cart.lines.length === 0) {
    return (
      <Card>
        <CardHead title="Line items" />
        <EmptyState
          icon={Package}
          title="No parts added yet"
          body="Add parts from the picker below — each one shows its current stock and price."
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHead title="Line items" meta={`${cart.lines.length} parts`} />
      <div>
        <div
          className="grid items-center px-3.5 py-2.5 bg-bg-subtle text-[11px] font-semibold text-fg-3 uppercase tracking-caption border-b border-border"
          style={{ gridTemplateColumns: '1fr 110px 130px 130px 36px' }}
        >
          <span>Part</span>
          <span className="text-center">Qty</span>
          <span className="text-right">Unit price</span>
          <span className="text-right">Subtotal</span>
          <span />
        </div>
        {cart.lines.map((line) => (
          <div
            key={line.partId}
            className="grid items-center px-3.5 py-2.5 border-b border-border last:border-0"
            style={{ gridTemplateColumns: '1fr 110px 130px 130px 36px' }}
          >
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">{line.name}</div>
              <div className="font-mono text-[11px] text-fg-3 truncate">
                {line.partCode} · {line.stockQuantity} in stock
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <button
                onClick={() => cart.updateQty(line.partId, -1)}
                className="w-7 h-7 rounded-sm border border-border-strong hover:bg-bg-subtle text-fg-1 flex items-center justify-center"
                aria-label="Decrease quantity"
              >
                –
              </button>
              <span className="font-mono font-semibold w-6 text-center">
                {line.quantity}
              </span>
              <button
                onClick={() => cart.updateQty(line.partId, 1)}
                disabled={line.quantity >= line.stockQuantity}
                className="w-7 h-7 rounded-sm border border-border-strong hover:bg-bg-subtle text-fg-1 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <span className="text-right vps-mono">
              {formatNpr(line.sellingPrice)}
            </span>
            <span className="text-right vps-money font-bold">
              {formatNpr(line.sellingPrice * line.quantity)}
            </span>
            <button
              onClick={() => cart.removeLine(line.partId)}
              className="p-1.5 text-fg-3 hover:text-crimson-500 hover:bg-crimson-50 rounded-sm justify-self-end"
              aria-label="Remove line"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Add another part                                                          */
/* -------------------------------------------------------------------------- */

function AddPartsCard({ search, setSearch, parts, onPick }) {
  return (
    <Card>
      <CardHead title="Add another part" />
      <CardBody>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code or name…"
          className="mb-3"
        />
        {parts.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No parts match"
            body="Try a different code, or ask the admin to add it to inventory."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {parts.slice(0, 8).map((p) => (
              <button
                key={p.id}
                onClick={() => onPick(p)}
                disabled={p.stockQuantity <= 0}
                className={cn(
                  'text-left bg-surface border border-border rounded-md p-2.5',
                  'flex items-center gap-2.5 transition-colors duration-fast',
                  'hover:bg-bg-subtle hover:border-border-strong',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                <div className="w-9 h-9 rounded-md bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                  <Package className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{p.name}</div>
                  <div className="font-mono text-[10px] text-fg-3 truncate">
                    {formatNpr(p.sellingPrice)} · {p.stockQuantity} in stock
                  </div>
                </div>
                <Plus className="w-3.5 h-3.5 text-fg-3 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sticky summary card with the loyalty moment                              */
/* -------------------------------------------------------------------------- */

function SummaryCard({ cart, totals, loyalty, submitting, onCreate }) {
  return (
    <Card>
      <CardHead title="Summary" />
      <CardBody className="flex flex-col gap-1">
        <SummaryRow
          label={`Subtotal (${cart.lines.length} ${cart.lines.length === 1 ? 'part' : 'parts'})`}
          value={formatNpr(totals.subtotal)}
        />

        {/* Loyalty hint vs. celebration card. The eligible flip is what makes this UI feel alive. */}
        {!loyalty.eligible && totals.subtotal > 0 && (
          <LoyaltyHint remaining={loyalty.remainingToUnlock} />
        )}
        {loyalty.eligible && (
          <LoyaltyCard
            discount={loyalty.discount}
            threshold={loyalty.threshold}
            rate={loyalty.rate}
          />
        )}

        <SummaryRow label="VAT 13%" value={formatNpr(totals.vat)} />

        <div className="h-px bg-border my-2" />

        <div className="flex justify-between items-baseline">
          <span className="font-bold text-fg-1">Total</span>
          <span
            className={cn(
              'vps-money font-bold text-xl',
              loyalty.eligible ? 'text-amber-700' : 'text-fg-1',
            )}
          >
            {formatNpr(totals.total)}
          </span>
        </div>

        <div className="h-px bg-border my-3" />

        <Field label="Payment">
          <Select
            value={cart.paymentMethod}
            onChange={(e) => cart.setPaymentMethod(e.target.value)}
          >
            <option value="cash">Cash · full payment</option>
            <option value="cash_partial">Cash · partial</option>
            <option value="credit">Credit (due in 30 days)</option>
            <option value="esewa">eSewa</option>
            <option value="khalti">Khalti</option>
          </Select>
        </Field>

        <Input
          label="Amount paid"
          type="number"
          step="0.01"
          min="0"
          mono
          value={cart.amountPaid}
          onChange={(e) => cart.setAmountPaid(e.target.value)}
          placeholder="0.00"
          className="mt-2"
        />

        {(cart.paymentMethod === 'credit' || Number(cart.amountPaid) < totals.total) && (
          <Input
            label="Due date"
            type="date"
            value={cart.dueDate}
            onChange={(e) => cart.setDueDate(e.target.value)}
            className="mt-2"
          />
        )}

        <Textarea
          label="Notes"
          value={cart.notes}
          onChange={(e) => cart.setNotes(e.target.value)}
          placeholder="Optional — service performed, follow-up reminder…"
          className="mt-2"
        />

        <Button
          onClick={onCreate}
          disabled={submitting || !cart.customer || cart.lines.length === 0}
          size="lg"
          className="mt-4 w-full"
        >
          <Receipt />
          {submitting ? 'Creating invoice…' : 'Create & email invoice'}
        </Button>
      </CardBody>
    </Card>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-fg-2">{label}</span>
      <span className="vps-money">{value}</span>
    </div>
  );
}
