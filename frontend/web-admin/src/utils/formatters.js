export function formatCurrency(value) {
  const amount = Number(value || 0);
  const rupee = '\u20B9';
  if (amount >= 100000) {
    return rupee + (amount / 100000).toFixed(1) + 'L';
  }
  return rupee + amount.toLocaleString('en-IN');
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-IN');
}

export function formatPercentage(value) {
  return Number(value || 0).toFixed(1) + '%';
}
