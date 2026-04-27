// VPS locale formatters — Nepalese conventions enforced everywhere.
// All numbers use Indian-style grouping (1,23,456.78 not 123,456.78).

const moneyFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
});

export const formatNpr = (value) => `Rs. ${moneyFormatter.format(Number(value) || 0)}`;

export const formatDate = (iso) =>
  iso ? dateFormatter.format(new Date(iso)) : '—';

export const formatDateTime = (iso) =>
  iso ? dateTimeFormatter.format(new Date(iso)) : '—';

export const formatTime = (iso) =>
  iso ? timeFormatter.format(new Date(iso)) : '—';

// Vehicle numbers: BA 12 PA 3456 — auto-uppercase, single-space normalised
export const formatVehicleNumber = (value) =>
  String(value || '').toUpperCase().replace(/\s+/g, ' ').trim();

// Phones — accepts +977 9XXXXXXXXX, displays with the space
export const formatPhone = (value) => {
  const raw = String(value || '').replace(/[^\d+]/g, '');
  if (raw.startsWith('+977') && raw.length === 14) {
    return `+977 ${raw.slice(4)}`;
  }
  return raw;
};

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
