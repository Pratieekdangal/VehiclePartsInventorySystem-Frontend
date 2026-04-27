import { cn } from '../../lib/cn';

// Single 64px line icon centered, headline + actionable line.
// Per design system: empty states *teach*, never just say "no data".
export default function EmptyState({ icon: Icon, title, body, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-12 gap-3',
        className,
      )}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-bg-subtle flex items-center justify-center text-fg-3 mb-2">
          <Icon className="w-8 h-8" strokeWidth={1.5} />
        </div>
      )}
      {title && <h3 className="vps-h4 text-fg-1">{title}</h3>}
      {body && <p className="text-sm text-fg-2 max-w-sm">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
