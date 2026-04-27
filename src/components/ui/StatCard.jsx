import { cn } from '../../lib/cn';

export default function StatCard({ label, value, delta, deltaTone, alert, className }) {
  const deltaClass = {
    up: 'text-emerald-500',
    down: 'text-crimson-500',
    neutral: 'text-fg-2',
  }[deltaTone] || 'text-fg-2';

  return (
    <div
      className={cn(
        'bg-surface border rounded-lg p-5 flex flex-col gap-2',
        alert ? 'border-crimson-200' : 'border-border',
        className,
      )}
    >
      <span className="vps-caption">{label}</span>
      <span
        className={cn(
          'font-display font-extrabold text-2xl tracking-display',
          alert ? 'text-crimson-700' : 'text-fg-1',
        )}
      >
        {value}
      </span>
      {delta && (
        <span className={cn('text-xs font-semibold', deltaClass)}>
          {delta}
        </span>
      )}
    </div>
  );
}
