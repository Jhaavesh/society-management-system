const API_URL = String(process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");

function requireApiUrl() {
  if (!API_URL) throw new Error("Set EXPO_PUBLIC_API_URL before using the live resident app");
  return API_URL;
}

export async function login(email, password) {
  const response = await fetch(`${requireApiUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Unable to sign in");
  return body;
}

export async function getResidentData(token, societyId) {
  const baseUrl = requireApiUrl();
  const headers = { Authorization: `Bearer ${token}` };
  const [society, flat, bills, payments, notices, visitors] = await Promise.all([
    fetch(`${baseUrl}/societies/${societyId}`, { headers }).then(readResponse),
    fetch(`${baseUrl}/flats?societyId=${societyId}`, { headers }).then(readResponse).then((items) => items[0] || null),
    fetch(`${baseUrl}/maintenance?societyId=${societyId}`, { headers }).then(readResponse),
    fetch(`${baseUrl}/payments?societyId=${societyId}`, { headers }).then(readResponse),
    fetch(`${baseUrl}/notices?societyId=${societyId}`, { headers }).then(readResponse),
    fetch(`${baseUrl}/visitors?societyId=${societyId}`, { headers }).then(readResponse)
  ]);
  return { society, flat, bills, payments, notices, visitors };
}

export function createComplaint(token, societyId, flatId, category, description) {
  return writeResidentData(token, "/complaints", { societyId, flatId, category, description, priority: "medium" });
}

export function createVisitor(token, societyId, flatId, visitorName, visitorMobile, visitDate) {
  return writeResidentData(token, "/visitors", { societyId, flatId, visitorName, visitorMobile, purpose: "Guest visit", visitDate });
}

async function writeResidentData(token, path, payload) {
  const response = await fetch(`${requireApiUrl()}${path}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  return readResponse(response);
}

async function readResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Unable to load resident data");
  return body;
}
