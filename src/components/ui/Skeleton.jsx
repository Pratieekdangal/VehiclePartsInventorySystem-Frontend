import { cn } from '../../lib/cn';

// Pulse 1.4s opacity 0.5→1, no shimmer-bars (design system voice rule).
export default function Skeleton({ className }) {
  return <div className={cn('bg-bg-subtle rounded-sm animate-skeleton', className)} />;
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-3.5 py-3">
          <Skeleton className="h-4 w-24" />
        </td>
      ))}
    </tr>
  );
}
