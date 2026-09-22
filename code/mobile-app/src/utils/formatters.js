// src/utils/formatters.js

export const Theme = {
  navy: '#111b31',
  blue: '#6572ef',
  ink: '#172033',
  muted: '#7b8496',
  line: '#e9edf3',
  canvas: '#f7f8fb',
  mint: '#43c6a5',
  amber: '#f4b45b',
  rose: '#ef7184',
};

export function formatAmount(item) {
  const amount = Number(item?.amount ?? item?.amountPaid);
  return Number.isFinite(amount) ? '\u20B9' + amount : '\u20B90';
}

export function formatDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function initials(name = 'Resident') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}
