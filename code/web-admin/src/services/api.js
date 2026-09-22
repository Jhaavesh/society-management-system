const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("societyOS.token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Request failed");
  return body;
}

export const api = {
  login: (email, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  societies: () => request("/societies"),
  createSociety: (payload) => request("/societies", { method: "POST", body: JSON.stringify(payload) }),
  dashboard: (societyId) => request(`/dashboard/${societyId}?societyId=${societyId}`),
  buildings: (societyId) => request(`/buildings?societyId=${societyId}`),
  createBuilding: (societyId, payload) => request("/buildings", { method: "POST", body: JSON.stringify({ ...payload, societyId }) }),
  flats: (societyId, buildingId = "") => request(`/flats?societyId=${societyId}${buildingId ? `&buildingId=${buildingId}` : ""}`),
  createFlat: (societyId, payload) => request("/flats", { method: "POST", body: JSON.stringify({ ...payload, societyId }) }),
  residents: (societyId) => request(`/residents?societyId=${societyId}`),
  createResident: (societyId, payload) => request("/residents", { method: "POST", body: JSON.stringify({ ...payload, societyId }) }),
  bills: (societyId) => request(`/maintenance?societyId=${societyId}`),
  createBill: (societyId, payload) => request("/maintenance", { method: "POST", body: JSON.stringify({ ...payload, societyId }) }),
  updateBill: (societyId, id, payload) => request(`/maintenance/${id}?societyId=${societyId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  payments: (societyId) => request(`/payments?societyId=${societyId}`),
  createPayment: (societyId, payload) => request("/payments", { method: "POST", body: JSON.stringify({ ...payload, societyId }) }),
  complaints: (societyId) => request(`/complaints?societyId=${societyId}`),
  createComplaint: (societyId, payload) => request("/complaints", { method: "POST", body: JSON.stringify({ ...payload, societyId }) }),
  updateComplaint: (societyId, id, payload) => request(`/complaints/${id}?societyId=${societyId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  notices: (societyId) => request(`/notices?societyId=${societyId}`),
  createNotice: (societyId, payload) => request("/notices", { method: "POST", body: JSON.stringify({ ...payload, societyId }) }),
  visitors: (societyId) => request(`/visitors?societyId=${societyId}`),
  createVisitor: (societyId, payload) => request("/visitors", { method: "POST", body: JSON.stringify({ ...payload, societyId }) }),
  updateVisitor: (societyId, id, payload) => request(`/visitors/${id}?societyId=${societyId}`, { method: "PATCH", body: JSON.stringify(payload) })
};
