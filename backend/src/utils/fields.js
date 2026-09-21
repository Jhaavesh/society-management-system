export function pickAllowedFields(source = {}, allowedFields = []) {
  const allowed = new Set(allowedFields);
  const values = {};
  const unknown = [];
  for (const [key, value] of Object.entries(source)) {
    if (allowed.has(key)) values[key] = value;
    else unknown.push(key);
  }
  return { values, unknown };
}
