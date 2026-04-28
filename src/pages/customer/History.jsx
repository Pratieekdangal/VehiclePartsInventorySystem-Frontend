import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Receipt } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { StatusPill, LoyaltyPill } from '../../components/ui/Pill';
import Skeleton from '../../components/ui/Skeleton';
import { sales } from '../../api/endpoints';
import { formatNpr, formatDate } from '../../lib/format';

export default function CustomerHistory() {
  const [items, setItems] = useState(null);
  // First card expanded by default per design system spec
  const [expanded, setExpanded] = useState(new Set([0]));

  useEffect(() => {
    sales.mine()
      .then((rows) => {
        setItems(rows);
        if (rows.length > 0) setExpanded(new Set([rows[0].id]));
      })
      .catch(() => setItems([]));
  }, []);

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="px-1">
        <h1 className="font-display font-bold text-2xl tracking-h2">Purchase history</h1>
        <p className="vps-body-sm mt-1">Every invoice ever issued to you.</p>
      </div>

      {items === null ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No purchases yet"
          body="Once you buy parts or get serviced, every invoice lands here for your records."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((inv) => {
            const isOpen = expanded.has(inv.id);
            return (
              <Card key={inv.id} className="overflow-hidden">
                <button
                  onClick={() => toggle(inv.id)}
                  className="w-full text-left p-3.5 flex items-center gap-3 hover:bg-bg-subtle transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-fg-2">{inv.invoiceNumber}</span>
                      {inv.isLoyaltyDiscountApplied && <LoyaltyPill>★ 10% off</LoyaltyPill>}
                    </div>
                    <div className="font-display font-extrabold text-lg mt-0.5">
                      {formatNpr(inv.totalAmount)}
                    </div>
                    <div className="text-xs text-fg-3 mt-0.5">
                      {formatDate(inv.invoiceDate)} · {inv.items.length} {inv.items.length === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusPill status={inv.paymentStatus} />
                    {isOpen
                      ? <ChevronUp className="w-4 h-4 text-fg-3" />
                      : <ChevronDown className="w-4 h-4 text-fg-3" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border bg-bg-subtle/50">
                    <div className="px-3.5 py-3 space-y-2">
                      {inv.items.map((it, i) => (
                        <div key={i} className="flex items-baseline gap-3 text-sm">
                          <span className="font-mono text-[11px] text-fg-3 shrink-0">×{it.quantity}</span>
                          <span className="flex-1 min-w-0 truncate">{it.partName}</span>
                          <span className="font-mono text-fg-1">{formatNpr(it.lineTotal)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="px-3.5 py-2.5 border-t border-border bg-surface space-y-1 text-xs">
                      <Row label="Subtotal" value={formatNpr(inv.subtotal)} />
                      {inv.discountAmount > 0 && (
                        <Row label="Loyalty discount" value={`– ${formatNpr(inv.discountAmount)}`} amber />
                      )}
                      <Row label="Paid" value={formatNpr(inv.amountPaid)} />
                      {inv.balanceDue > 0 && (
                        <Row label="Balance due" value={formatNpr(inv.balanceDue)} crimson />
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, amber, crimson }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-fg-3 flex-1">{label}</span>
      <span className={`font-mono ${amber ? 'text-amber-700 font-bold' : crimson ? 'text-crimson-700 font-bold' : 'text-fg-1'}`}>
        {value}
      </span>
    </div>
  );
}
