import { forwardRef } from 'react';
import { CircleAlert, Search } from 'lucide-react';
import { cn } from '../../lib/cn';

const inputBase = cn(
  'w-full bg-surface text-fg-1 border border-border-strong rounded-sm',
  'px-3 py-2 text-sm font-body',
  'placeholder:text-fg-3',
  'transition-colors duration-fast ease-standard',
  'focus:outline-none focus:border-primary-500 focus:shadow-focus',
  'disabled:bg-bg-subtle disabled:text-fg-3 disabled:cursor-not-allowed',
);

export const Field = ({ label, hint, error, children, className }) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    {label && <label className="vps-label">{label}</label>}
    {children}
    {error ? (
      <span className="flex items-center gap-1 text-xs text-crimson-600">
        <CircleAlert className="w-3 h-3" />
        {error}
      </span>
    ) : hint ? (
      <span className="text-xs text-fg-3">{hint}</span>
    ) : null}
  </div>
);

export const Input = forwardRef(function Input(
  { label, hint, error, className, mono, ...rest },
  ref,
) {
  const input = (
    <input
      ref={ref}
      className={cn(
        inputBase,
        mono && 'font-mono',
        error && 'border-crimson-500 focus:border-crimson-500 focus:shadow-[0_0_0_3px_rgba(220,47,71,0.25)]',
      )}
      {...rest}
    />
  );
  if (!label && !hint && !error) return <div className={className}>{input}</div>;
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {input}
    </Field>
  );
});

export const Select = forwardRef(function Select(
  { label, hint, error, className, children, ...rest },
  ref,
) {
  const select = (
    <select
      ref={ref}
      className={cn(
        inputBase,
        'pr-8 appearance-none bg-no-repeat bg-[right_10px_center]',
        'bg-[url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'/></svg>")]',
        error && 'border-crimson-500',
      )}
      {...rest}
    >
      {children}
    </select>
  );
  if (!label && !hint && !error) return <div className={className}>{select}</div>;
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {select}
    </Field>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, hint, error, className, rows = 3, ...rest },
  ref,
) {
  const ta = (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        inputBase,
        'resize-y min-h-[72px]',
        error && 'border-crimson-500',
      )}
      {...rest}
    />
  );
  if (!label && !hint && !error) return <div className={className}>{ta}</div>;
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {ta}
    </Field>
  );
});

export const SearchInput = forwardRef(function SearchInput(
  { className, ...rest },
  ref,
) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3 pointer-events-none" />
      <input
        ref={ref}
        type="search"
        className={cn(inputBase, 'pl-9 h-9')}
        {...rest}
      />
    </div>
  );
});
