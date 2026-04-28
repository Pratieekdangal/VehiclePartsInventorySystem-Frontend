import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import Button from './Button';

// Scrim uses rgba(15,23,42,0.42) + 2px backdrop blur per design system.
// Body locked while open. Esc closes.

export default function Modal({ open, onClose, title, subtitle, size = 'md', children, footer, className }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(15,23,42,0.42)', backdropFilter: 'blur(2px)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative bg-surface rounded-lg shadow-lg w-full overflow-hidden flex flex-col max-h-[90vh]',
          sizes[size],
          className,
        )}
      >
        <header className="px-6 pt-5 pb-2 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="font-display font-bold text-lg tracking-h2 text-fg-1">{title}</h2>
              {subtitle && <p className="vps-body-sm mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-sm text-fg-3 hover:bg-bg-subtle hover:text-fg-1 -mr-1.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <footer className="px-6 py-3.5 bg-bg-subtle border-t border-border flex items-center gap-2 justify-end">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

// Standard confirmation modal — title is the action as a question per
// design system voice rules ("Cancel this appointment?"), primary repeats
// the verb, secondary is "Keep it" not "Cancel".
export function ConfirmModal({ open, onClose, title, body, confirmLabel, danger, onConfirm, busy }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Keep it</Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="vps-body text-fg-2">{body}</p>
    </Modal>
  );
}
