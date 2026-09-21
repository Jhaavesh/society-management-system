const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Unable to sign in");
  return body;
}

export async function getResidentData(token, societyId) {
  const headers = { Authorization: `Bearer ${token}` };
  const [bills, notices, visitors] = await Promise.all([
    fetch(`${API_URL}/maintenance?societyId=${societyId}`, { headers }).then(readResponse),
    fetch(`${API_URL}/notices?societyId=${societyId}`, { headers }).then(readResponse),
    fetch(`${API_URL}/visitors?societyId=${societyId}`, { headers }).then(readResponse)
  ]);
  return { bills, notices, visitors };
}

async function readResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Unable to load resident data");
  return body;
}
