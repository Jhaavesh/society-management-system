export function formatCurrency(value) {
  const amount = Number(value || 0);
  return amount >= 100000
    ? Rs L
    : Rs ;
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-IN');
}

export function formatPercentage(value) {
  return ${Number(value || 0).toFixed(1)}%;
}
