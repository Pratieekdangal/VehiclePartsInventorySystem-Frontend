import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Inbox } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { StatusPill } from '../../components/ui/Pill';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { partRequests, customers } from '../../api/endpoints';
import { formatDate } from '../../lib/format';

export default function CustomerPartRequests() {
  const [items, setItems] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [draft, setDraft] = useState({ partName: '', compatibleVehicle: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => partRequests.mine().then(setItems).catch(() => setItems([]));

  useEffect(() => { load(); }, []);
  useEffect(() => {
    customers.myVehicles()
      .then((vs) => {
        setVehicles(vs);
        if (vs.length > 0 && !draft.compatibleVehicle) {
          const v = vs[0];
          setDraft((d) => ({ ...d, compatibleVehicle: `${v.make} ${v.model} ${v.year}` }));
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      await partRequests.create(draft);
      toast.success('Request sent — admin will respond shortly');
      setDraft({ partName: '', compatibleVehicle: draft.compatibleVehicle, description: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not send');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="px-1">
        <h1 className="font-display font-bold text-2xl tracking-h2">Request a part</h1>
        <p className="vps-body-sm mt-1">Need something not in our catalogue? Tell us — we'll source it.</p>
      </div>

      <Card className="p-4">
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Input
            label="Part name"
            required
            value={draft.partName}
            onChange={(e) => setDraft({ ...draft, partName: e.target.value })}
            placeholder="e.g. Front headlight assembly"
          />
          {vehicles.length > 0 ? (
            <Select
              label="Compatible vehicle"
              value={draft.compatibleVehicle}
              onChange={(e) => setDraft({ ...draft, compatibleVehicle: e.target.value })}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={`${v.make} ${v.model} ${v.year}`}>
                  {v.vehicleNumber} — {v.make} {v.model} {v.year}
                </option>
              ))}
              <option value="">Other / not specified</option>
            </Select>
          ) : (
            <Input
              label="Compatible vehicle"
              value={draft.compatibleVehicle}
              onChange={(e) => setDraft({ ...draft, compatibleVehicle: e.target.value })}
              placeholder="Honda Civic 2020"
            />
          )}
          <Textarea
            label="Notes"
            rows={3}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Brand preference, urgency, photos shared on phone…"
          />
          <Button type="submit" disabled={submitting || !draft.partName}>
            {submitting ? 'Sending…' : 'Send request'}
          </Button>
        </form>
      </Card>

      <div>
        <h2 className="font-display font-bold text-lg tracking-h2 mb-2 px-1">Past requests</h2>
        {items === null ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No requests yet"
            body="Your part requests will appear here once submitted, with admin replies."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {items.map((r) => (
              <Card key={r.id} className="p-3.5">
                <div className="flex items-start gap-2 mb-2">
                  <p className="font-semibold text-sm flex-1">{r.partName}</p>
                  <StatusPill status={r.status} />
                </div>
                <p className="text-xs text-fg-3 mb-1.5">
                  {r.compatibleVehicle && <>For {r.compatibleVehicle} · </>}
                  {formatDate(r.createdAt)}
                </p>
                {r.description && <p className="text-xs text-fg-2 mb-2">{r.description}</p>}
                {r.adminResponse && (
                  <div className="bg-bg-subtle rounded-md p-2.5 border-l-2 border-primary-500">
                    <p className="vps-caption mb-1">Reply</p>
                    <p className="text-sm text-fg-1">{r.adminResponse}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
