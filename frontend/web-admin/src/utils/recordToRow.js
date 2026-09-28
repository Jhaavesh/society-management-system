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