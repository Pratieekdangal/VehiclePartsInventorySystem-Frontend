import { cn } from '../../lib/cn';

// Status pills with leading dot rendered as a pseudo-element via CSS classes,
// matching kit.css. Each variant fixes background, text, and border together
// so the dot picks up the right tone via `currentColor`.
const variants = {
  paid:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  partial:   'bg-primary-50 text-primary-700 border-primary-200',
  confirmed: 'bg-primary-50 text-primary-700 border-primary-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  fulfilled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  overdue:   'bg-crimson-50 text-crimson-700 border-crimson-200',
  rejected:  'bg-crimson-50 text-crimson-700 border-crimson-200',
  cancelled: 'bg-steel-50 text-steel-600 border-steel-200',
  loyalty:   'bg-amber-50 text-amber-700 border-amber-200',
};

export default function Pill({ variant = 'pending', className, children, leading }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill border text-xs font-semibold',
        variants[variant] || variants.pending,
        className,
      )}
    >
      {leading ?? <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}

// Maps the backend's PaymentStatus / AppointmentStatus / PartRequestStatus
// strings to Pill variants and labels in one place.
export const statusLabels = {
  Paid: { variant: 'paid', label: 'Paid' },
  PartiallyPaid: { variant: 'partial', label: 'Partially paid' },
  Pending: { variant: 'pending', label: 'Pending' },
  Overdue: { variant: 'overdue', label: 'Overdue' },
  Confirmed: { variant: 'confirmed', label: 'Confirmed' },
  Completed: { variant: 'completed', label: 'Completed' },
  Cancelled: { variant: 'cancelled', label: 'Cancelled' },
  Fulfilled: { variant: 'fulfilled', label: 'Fulfilled' },
  Rejected: { variant: 'rejected', label: 'Rejected' },
};

export function StatusPill({ status }) {
  const meta = statusLabels[status] || { variant: 'pending', label: status };
  return <Pill variant={meta.variant}>{meta.label}</Pill>;
}

export function LoyaltyPill({ children = 'Regular' }) {
  return (
    <Pill
      variant="loyalty"
      leading={<span className="text-amber-400 text-[10px] leading-none">★</span>}
    >
      {children}
    </Pill>
  );
}
