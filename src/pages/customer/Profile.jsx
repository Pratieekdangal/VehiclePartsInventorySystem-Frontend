import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Car, LogOut, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import Modal, { ConfirmModal } from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import Avatar from '../../components/ui/Avatar';
import { customers as customersApi } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import { formatPhone, formatDate, formatVehicleNumber } from '../../lib/format';
import Skeleton from '../../components/ui/Skeleton';

const blankVehicle = {
  vehicleNumber: '', make: '', model: '',
  year: new Date().getFullYear(), color: '', mileage: 0,
};

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null); // null | 'new' | vehicle
  const [vehicleDraft, setVehicleDraft] = useState(blankVehicle);
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setProfile(null);
    setVehicles(null);
    customersApi.me().then(setProfile).catch(() => toast.error('Could not load profile'));
    customersApi.myVehicles().then(setVehicles).catch(() => setVehicles([]));
  };

  useEffect(() => { load(); }, []);

  const startEditingProfile = () => {
    setProfileDraft({
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber.startsWith('+977') ? profile.phoneNumber : `+977 ${profile.phoneNumber}`,
      address: profile.address || '',
    });
    setEditingProfile(true);
  };

  const submitProfile = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      await customersApi.updateMe({
        fullName: profileDraft.fullName,
        phoneNumber: profileDraft.phoneNumber.replace(/\s+/g, ''),
        address: profileDraft.address,
      });
      toast.success('Profile updated');
      setEditingProfile(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const submitVehicle = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...vehicleDraft,
        year: Number(vehicleDraft.year) || 0,
        mileage: Number(vehicleDraft.mileage) || 0,
      };
      if (editingVehicle === 'new') {
        await customersApi.addMyVehicle(payload);
        toast.success(`${payload.vehicleNumber} added`);
      } else {
        await customersApi.updateMyVehicle(editingVehicle.id, payload);
        toast.success(`${payload.vehicleNumber} updated`);
      }
      setEditingVehicle(null);
      setVehicleDraft(blankVehicle);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const removeVehicle = async () => {
    if (!deletingVehicle) return;
    setSubmitting(true);
    try {
      await customersApi.deleteMyVehicle(deletingVehicle.id);
      toast.success(`${deletingVehicle.vehicleNumber} removed`);
      setDeletingVehicle(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Profile card */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar name={profile.fullName} size={48} className="text-base" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{profile.fullName}</p>
            <p className="text-xs text-fg-3 truncate">{profile.email}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={startEditingProfile}>
            <Pencil />Edit
          </Button>
        </div>
        <div className="space-y-2 text-sm pt-3 border-t border-border">
          <Row label="Phone" value={<span className="font-mono">{formatPhone(profile.phoneNumber)}</span>} />
          {profile.address && <Row label="Address" value={profile.address} />}
        </div>
      </Card>

      {/* Vehicles section */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="font-display font-bold text-lg tracking-h2">My vehicles</h2>
          <Button
            size="sm"
            onClick={() => { setVehicleDraft(blankVehicle); setEditingVehicle('new'); }}
          >
            <Plus />Add
          </Button>
        </div>

        {vehicles === null ? (
          <Skeleton className="h-24 rounded-lg" />
        ) : vehicles.length === 0 ? (
          <Card>
            <EmptyState
              icon={Car}
              title="Add your first vehicle"
              body="Let us know what you drive so we can match parts and bookings to it."
              action={<Button onClick={() => { setVehicleDraft(blankVehicle); setEditingVehicle('new'); }}><Plus />Add vehicle</Button>}
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {vehicles.map((v) => (
              <Card key={v.id} className="p-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                    <Car className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-bold text-sm">{v.vehicleNumber}</p>
                    <p className="text-xs text-fg-2 mt-0.5">{v.make} {v.model} · {v.year}</p>
                    <p className="text-[11px] text-fg-3 mt-0.5">
                      {v.color || 'Color not set'} · {v.mileage} km
                      {v.lastServiceDate && ` · last serviced ${formatDate(v.lastServiceDate)}`}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setVehicleDraft({
                          vehicleNumber: v.vehicleNumber,
                          make: v.make,
                          model: v.model,
                          year: v.year,
                          color: v.color || '',
                          mileage: v.mileage,
                        });
                        setEditingVehicle(v);
                      }}
                      className="p-1.5 text-fg-3 hover:text-fg-1 hover:bg-bg-subtle rounded-sm"
                      aria-label="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingVehicle(v)}
                      className="p-1.5 text-fg-3 hover:text-crimson-600 hover:bg-crimson-50 rounded-sm"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Sign out */}
      <Card className="overflow-hidden mt-2">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-crimson-50 text-crimson-600 transition-colors"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span className="text-sm font-semibold flex-1 text-left">Sign out</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </Card>

      {/* Edit profile modal */}
      <Modal
        open={editingProfile}
        onClose={() => setEditingProfile(false)}
        title="Edit your details"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingProfile(false)}>Cancel</Button>
            <Button onClick={submitProfile} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      >
        {profileDraft && (
          <form onSubmit={submitProfile} className="flex flex-col gap-3">
            <Input
              label="Full name"
              required
              value={profileDraft.fullName}
              onChange={(e) => setProfileDraft({ ...profileDraft, fullName: e.target.value })}
            />
            <Input
              label="Phone"
              mono
              required
              value={profileDraft.phoneNumber}
              onChange={(e) => setProfileDraft({ ...profileDraft, phoneNumber: e.target.value })}
              placeholder="+977 9XXXXXXXXX"
            />
            <Textarea
              label="Address"
              value={profileDraft.address}
              onChange={(e) => setProfileDraft({ ...profileDraft, address: e.target.value })}
              rows={2}
            />
          </form>
        )}
      </Modal>

      {/* Vehicle modal */}
      <Modal
        open={!!editingVehicle}
        onClose={() => setEditingVehicle(null)}
        title={editingVehicle === 'new' ? 'Add a vehicle' : `Edit ${editingVehicle?.vehicleNumber || ''}`}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingVehicle(null)}>Cancel</Button>
            <Button onClick={submitVehicle} disabled={submitting}>
              {submitting ? 'Saving…' : editingVehicle === 'new' ? 'Add vehicle' : 'Save changes'}
            </Button>
          </>
        }
      >
        <form onSubmit={submitVehicle} className="grid grid-cols-2 gap-3">
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
            mono
            required
            min="1950"
            max={new Date().getFullYear() + 1}
            value={vehicleDraft.year}
            onChange={(e) => setVehicleDraft({ ...vehicleDraft, year: e.target.value })}
          />
          <Input
            label="Mileage (km)"
            type="number"
            mono
            min="0"
            value={vehicleDraft.mileage}
            onChange={(e) => setVehicleDraft({ ...vehicleDraft, mileage: e.target.value })}
          />
          <Input
            label="Colour"
            value={vehicleDraft.color}
            onChange={(e) => setVehicleDraft({ ...vehicleDraft, color: e.target.value })}
            placeholder="Pearl White"
            className="col-span-2"
          />
        </form>
      </Modal>

      <ConfirmModal
        open={!!deletingVehicle}
        onClose={() => setDeletingVehicle(null)}
        title={`Remove ${deletingVehicle?.vehicleNumber}?`}
        body="Past invoices linked to this vehicle stay intact, but you can't book new services against it after removal."
        confirmLabel="Remove vehicle"
        danger
        busy={submitting}
        onConfirm={removeVehicle}
      />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-fg-3 text-xs uppercase tracking-caption font-medium w-16 shrink-0">{label}</span>
      <span className="text-fg-1 text-sm">{value}</span>
    </div>
  );
}
