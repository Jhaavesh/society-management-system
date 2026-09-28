export function recordToRow(record, headers) {
  const row = {};
  for (const header of headers) {
    let value = record[header.key];
    
    // Handle populated Mongoose objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (value.name) value = value.name;
      else if (value.flatNumber) value = value.flatNumber;
      else if (value.title) value = value.title;
      else if (value._id) value = value._id;
      else value = JSON.stringify(value);
    }
    
    row[header.key] = value;
  }
  return row;
}