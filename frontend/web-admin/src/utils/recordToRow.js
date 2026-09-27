export function recordToRow(record, headers) {
  const row = {};
  for (const header of headers) {
    const value = record[header.key];
    if (header.align) {
      row[header.key] = { value, align: header.align };
    } else {
      row[header.key] = value;
    }
  }
  return row;
}

export function formatCellValue(value, key) {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object' && value.value !== undefined) {
    return value.value;
  }
  return value;
}