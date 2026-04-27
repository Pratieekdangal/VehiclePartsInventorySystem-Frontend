import { cn } from '../../lib/cn';

export function Card({ className, children }) {
  return (
    <div className={cn('bg-surface border border-border rounded-lg', className)}>
      {children}
    </div>
  );
}

export function CardHead({ title, meta, action, className }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-5 py-4 border-b border-border',
        className,
      )}
    >
      {title && (
        <h3 className="font-display font-bold text-base tracking-h2 text-fg-1">
          {title}
        </h3>
      )}
      {meta && <span className="ml-auto text-xs text-fg-3">{meta}</span>}
      {action && <div className={cn(meta ? '' : 'ml-auto')}>{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
