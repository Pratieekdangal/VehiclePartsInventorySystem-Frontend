import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Select, Textarea, Field } from '../../components/ui/Input';
import { ConfirmModal } from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { StatusPill } from '../../components/ui/Pill';
import { appointments, customers } from '../../api/endpoints';
import { formatDateTime, formatDate } from '../../lib/format';
import { cn } from '../../lib/cn';

const SERVICES = [
  'General service',
  'Engine oil change',
  'Brake check',
  'Battery replacement',
  'AC service',
  'Tyre rotation',
  'Diagnostic',
  'Other',
];

const TIMES = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30'];

// Build the next 7 days as ISO date strings (skip Sunday for Nepal — workshops typically closed)
const buildDays = () => {
  const days = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 0; days.length < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d.getDay() === 6) continue; // skip Saturday (or change as needed)
    days.push(d);
  }
  return days;
};

export default function CustomerBookService() {
  const [vehicles, setVehicles] = useState([]);
  const [items, setItems] = useState(null);
  const [draft, setDraft] = useState({
    vehicleId: '',
    serviceType: SERVICES[0],
    day: null,
    time: TIMES[0],
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(null);

  const days = buildDays();

  const load = () => {
    setItems(null);
    appointments.mine().then(setItems).catch(() => setItems([]));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    customers.myVehicles().then((vs) => {
      setVehicles(vs);
      if (vs.length > 0) setDraft((d) => ({ ...d, vehicleId: vs[0].id }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!draft.day && days.length > 0) setDraft((d) => ({ ...d, day: days[0].toISOString() }));
  }, [draft.day, days]);

  const submit = async (e) => {
    e?.preventDefault();
    if (!draft.day || !draft.time) {
      toast.error('Pick a day and a time');
      return;
    }
    setSubmitting(true);
    try {
      const day = new Date(draft.day);
      const [hh, mm] = draft.time.split(':');
      day.setHours(Number(hh), Number(mm), 0, 0);
      await appointments.create({
        vehicleId: draft.vehicleId || null,
        appointmentDate: day.toISOString(),
        serviceType: draft.serviceType,
        description: draft.notes,
      });
      toast.success('Booking confirmed — see you then');
      setDraft({ ...draft, notes: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not book');
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async () => {
    if (!cancelling) return;
    setSubmitting(true);
    try {
      await appointments.remove(cancelling.id);
      toast.success('Booking cancelled');
      setCancelling(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="px-1">
        <h1 className="font-display font-bold text-2xl tracking-h2">Book a service</h1>
        <p className="vps-body-sm mt-1">Pick a vehicle, a day, and a time slot. We'll confirm shortly.</p>
      </div>

      <Card className="p-4">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Vehicle">
            {vehicles.length === 0 ? (
              <p className="text-sm text-fg-3 px-3 py-2 border border-dashed border-border rounded-sm">
                Add a vehicle from your profile first.
              </p>
            ) : (
              <Select
                value={draft.vehicleId}
                onChange={(e) => setDraft({ ...draft, vehicleId: e.target.value })}
                required
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicleNumber} — {v.make} {v.model}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Select
            label="Service type"
            value={draft.serviceType}
            onChange={(e) => setDraft({ ...draft, serviceType: e.target.value })}
          >
            {SERVICES.map((s) => <option key={s}>{s}</option>)}
          </Select>

          <div>
            <span className="vps-label mb-2 block">Day</span>
            <div className="grid grid-cols-4 gap-2">
              {days.map((d) => {
                const iso = d.toISOString();
                const isActive = draft.day === iso;
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setDraft({ ...draft, day: iso })}
                    className={cn(
                      'rounded-sm border py-2.5 px-2 text-center transition-colors',
                      isActive
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'bg-surface border-border-strong text-fg-2 hover:bg-bg-subtle',
                    )}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-caption">
                      {d.toLocaleDateString('en-GB', { weekday: 'short' })}
                    </div>
                    <div className="font-display font-extrabold text-base mt-0.5 tracking-h2">
                      {d.getDate()}
                    </div>
                    <div className="text-[10px] opacity-80">
                      {d.toLocaleDateString('en-GB', { month: 'short' })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="vps-label mb-2 block">Time</span>
            <div className="grid grid-cols-4 gap-2">
              {TIMES.map((t) => {
                const isActive = draft.time === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDraft({ ...draft, time: t })}
                    className={cn(
                      'rounded-sm border py-2 px-2 font-mono text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'bg-surface border-border-strong text-fg-2 hover:bg-bg-subtle',
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <Textarea
            label="Notes (optional)"
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            rows={2}
            placeholder="e.g. Heard a knocking sound near the front-left wheel"
          />

          <Button type="submit" disabled={submitting || vehicles.length === 0} size="lg">
            {submitting ? 'Booking…' : 'Confirm booking'}
          </Button>
        </form>
      </Card>

      {/* Past bookings */}
      <div>
        <h2 className="font-display font-bold text-lg tracking-h2 mb-2 px-1">Your bookings</h2>
        {items === null ? (
          <Card className="p-4">Loading…</Card>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No bookings yet"
            body="Pick a slot above to schedule your first visit."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {items.map((a) => (
              <Card key={a.id} className="p-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary-50 text-primary-700 flex flex-col items-center justify-center shrink-0 font-display font-bold leading-none">
                    <span className="text-[9px] uppercase">{new Date(a.appointmentDate).toLocaleDateString('en-GB', { month: 'short' })}</span>
                    <span className="text-base mt-0.5">{new Date(a.appointmentDate).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{a.serviceType}</p>
                      <StatusPill status={a.status} />
                    </div>
                    <p className="text-xs text-fg-3 mt-0.5">
                      {formatDateTime(a.appointmentDate)}
                      {a.vehicleNumber && <> · <span className="font-mono">{a.vehicleNumber}</span></>}
                    </p>
                    {a.description && <p className="text-xs text-fg-2 mt-1">{a.description}</p>}
                  </div>
                  {(a.status === 'Pending' || a.status === 'Confirmed') && (
                    <button
                      onClick={() => setCancelling(a)}
                      className="p-1.5 text-fg-3 hover:text-crimson-600 hover:bg-crimson-50 rounded-sm shrink-0"
                      aria-label="Cancel booking"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        title="Cancel this booking?"
        body={`Your ${cancelling?.serviceType} on ${cancelling ? formatDate(cancelling.appointmentDate) : ''} will be cancelled. You can always book again.`}
        confirmLabel="Cancel booking"
        danger
        busy={submitting}
        onConfirm={cancel}
      />
    </div>
  );
}
