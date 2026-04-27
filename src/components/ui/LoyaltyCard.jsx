import { formatNpr } from '../../lib/format';

// The brand's signature moment. Reusable wherever a loyalty unlock happens.
// Mount triggers `pop` animation (520ms back-out). 🎉 orb has continuous glow.
// Spec lives in design-system/README.md → "The loyalty celebration card".

export default function LoyaltyCard({ discount, threshold = 5000, rate = 0.1 }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative overflow-hidden rounded-lg border border-amber-200 p-3.5 my-2.5 animate-pop"
      style={{
        background: 'linear-gradient(135deg, #fff8eb, #ffecc4)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 80% 20%, rgba(245,165,36,0.30), transparent 60%)',
        }}
      />

      <div className="relative flex items-center gap-2.5 mb-2">
        <div
          className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-white text-base shrink-0 animate-glow"
          style={{ boxShadow: '0 4px 12px -2px rgba(245,165,36,0.5)' }}
          aria-hidden
        >
          🎉
        </div>
        <div>
          <div className="font-display font-extrabold text-sm text-amber-700 leading-tight">
            Loyalty discount unlocked!
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">
            Subtotal crossed {formatNpr(threshold)}
          </div>
        </div>
      </div>

      <div className="relative flex justify-between items-baseline">
        <span className="text-xs font-semibold text-amber-700">
          {(rate * 100).toFixed(0)}% off
        </span>
        <span className="vps-money text-amber-700 font-bold">
          – {formatNpr(discount)}
        </span>
      </div>
    </div>
  );
}

export function LoyaltyHint({ remaining }) {
  return (
    <div className="px-3 py-2.5 bg-bg-subtle rounded-md text-xs text-fg-2 mt-1.5">
      Add{' '}
      <strong className="text-fg-1 font-mono">{formatNpr(remaining)}</strong>{' '}
      more to unlock the{' '}
      <strong className="text-amber-700">10% loyalty discount</strong>.
    </div>
  );
}
