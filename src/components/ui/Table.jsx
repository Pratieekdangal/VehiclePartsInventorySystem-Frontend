import { cn } from '../../lib/cn';

// Tables are dense and frequent — keep the API tiny so consumers can drop
// rows in directly, while shared header styling stays consistent.

export function Table({ className, children }) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  );
}

export function THead({ children }) {
  return (
    <thead className="bg-bg-subtle">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ className, align = 'left', children }) {
  return (
    <th
      className={cn(
        'px-3.5 py-2.5 text-xs font-semibold text-fg-3 uppercase tracking-caption border-b border-border',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TBody({ children, empty }) {
  if (!children || (Array.isArray(children) && children.length === 0)) {
    return (
      <tbody>
        <tr>
          <td colSpan={99} className="py-12 text-center text-fg-3 text-sm">
            {empty || 'Nothing to show yet.'}
          </td>
        </tr>
      </tbody>
    );
  }
  return <tbody>{children}</tbody>;
}

export function Tr({ className, ...rest }) {
  return (
    <tr
      className={cn(
        'border-b border-border last:border-0 hover:bg-surface-2 transition-colors duration-fast',
        className,
      )}
      {...rest}
    />
  );
}

export function Td({ className, align = 'left', mono, children, ...rest }) {
  return (
    <td
      className={cn(
        'px-3.5 py-3 align-middle text-sm text-fg-1',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        mono && 'font-mono',
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  );
}
