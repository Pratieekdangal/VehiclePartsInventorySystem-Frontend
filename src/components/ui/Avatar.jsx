import { initials } from '../../lib/format';
import { cn } from '../../lib/cn';

export default function Avatar({ name, size = 32, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary-500 text-white font-bold uppercase shrink-0',
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.4),
      }}
    >
      {initials(name) || '?'}
    </span>
  );
}
