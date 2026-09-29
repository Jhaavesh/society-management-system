const API_URL = String(process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const API_PREFIX = "/api/v1";

function requireApiUrl() {
  if (!API_URL) throw new Error("Set EXPO_PUBLIC_API_URL before using the live resident app");
  return API_URL;
}

async function safeFetch(url, options) {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (error.message.includes('Network request failed') || error.name === 'TypeError') {
      throw new Error("Network error. Please check your internet connection and try again.");
    }
    throw error;
  }
}

export async function login(email, password) {
  const response = await safeFetch(`${requireApiUrl()}${API_PREFIX}/auth/login`, {
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
    safeFetch(`${baseUrl}${API_PREFIX}/societies/${societyId}`, { headers }).then(readResponse),
    safeFetch(`${baseUrl}${API_PREFIX}/flats?societyId=${societyId}`, { headers }).then(readResponse).then((items) => items[0] || null),
    safeFetch(`${baseUrl}${API_PREFIX}/maintenance?societyId=${societyId}`, { headers }).then(readResponse),
    safeFetch(`${baseUrl}${API_PREFIX}/payments?societyId=${societyId}`, { headers }).then(readResponse),
    safeFetch(`${baseUrl}${API_PREFIX}/notices?societyId=${societyId}`, { headers }).then(readResponse),
    safeFetch(`${baseUrl}${API_PREFIX}/visitors?societyId=${societyId}`, { headers }).then(readResponse)
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
  const response = await safeFetch(`${requireApiUrl()}${API_PREFIX}${path}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  return readResponse(response);
}

async function readResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Unable to load resident data");
  return body.data !== undefined ? body.data : body;
}
