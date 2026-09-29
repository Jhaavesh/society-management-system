const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const API_PREFIX = "/api/v1";

function getToken() {
  return localStorage.getItem("societyOS.token");
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${API_PREFIX}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("societyOS.token");
      localStorage.removeItem("societyOS.session");
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = "/login";
      }
    }
    throw new Error(body.message || "Request failed");
  }
  return body.data !== undefined ? body.data : body;
}

export const api = {
  login: (email, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  societies: () => request("/societies"),
  createSociety: (payload) => request("/societies", { method: "POST", body: JSON.stringify(payload) }),
  updateSociety: (id, payload) => request(`/societies/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteSociety: (id) => request(`/societies/${id}`, { method: "DELETE" }),

  dashboard: (societyId) => request(`/dashboard/${societyId}?societyId=${societyId}`),

  buildings: (societyId) => request(`/buildings/${societyId}`),
  createBuilding: (societyId, payload) => request(`/buildings/${societyId}`, { method: "POST", body: JSON.stringify(payload) }),
  updateBuilding: (societyId, id, payload) => request(`/buildings/${societyId}/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteBuilding: (societyId, id) => request(`/buildings/${societyId}/${id}`, { method: "DELETE" }),

  flats: (societyId, buildingId = "") => request(`/flats?societyId=${societyId}${buildingId ? `&buildingId=${buildingId}` : ""}`),
  createFlat: (societyId, payload) => request("/flats", { method: "POST", body: JSON.stringify({ ...payload, societyId }) }),
  updateFlat: (societyId, id, payload) => request(`/flats/${id}?societyId=${societyId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteFlat: (societyId, id) => request(`/flats/${id}?societyId=${societyId}`, { method: "DELETE" }),

  residents: (societyId) => request(`/residents?societyId=${societyId}`),
  createResident: (societyId, payload) => request("/residents", { method: "POST", body: JSON.stringify({ ...payload, societyId }) }),
  updateResident: (societyId, id, payload) => request(`/residents/${id}?societyId=${societyId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteResident: (societyId, id) => request(`/residents/${id}?societyId=${societyId}`, { method: "DELETE" }),

  bills: (societyId) => request(`/maintenance?societyId=${societyId}`),
  createBill: (societyId, payload) => request("/maintenance", { method: "POST", body: JSON.stringify({ ...payload, societyId }) }),
  updateBill: (societyId, id, payload) => request(`/maintenance/${id}?societyId=${societyId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteBill: (societyId, id) => request(`/maintenance/${id}?societyId=${societyId}`, { method: "DELETE" }),

  payments: (societyId) => request(`/payments?societyId=${societyId}`),
  createPayment: (societyId, payload) => request("/payments", { method: "POST", body: JSON.stringify({ ...payload, societyId }) }),
  deletePayment: (societyId, id) => request(`/payments/${id}?societyId=${societyId}`, { method: "DELETE" }),

  complaints: (societyId) => request(`/complaints?societyId=${societyId}`),
  createComplaint: (societyId, payload) => request("/complaints", { method: "POST", body: JSON.stringify({ ...payload, societyId }) }),
  updateComplaint: (societyId, id, payload) => request(`/complaints/${id}?societyId=${societyId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteComplaint: (societyId, id) => request(`/complaints/${id}?societyId=${societyId}`, { method: "DELETE" }),

  notices: (societyId) => request(`/notices?societyId=${societyId}`),
  createNotice: (societyId, payload) => request("/notices", { method: "POST", body: JSON.stringify({ ...payload, societyId }) }),
  updateNotice: (societyId, id, payload) => request(`/notices/${id}?societyId=${societyId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteNotice: (societyId, id) => request(`/notices/${id}?societyId=${societyId}`, { method: "DELETE" }),

  visitors: (societyId) => request(`/visitors?societyId=${societyId}`),
  createVisitor: (societyId, payload) => request("/visitors", { method: "POST", body: JSON.stringify({ ...payload, societyId }) }),
  updateVisitor: (societyId, id, payload) => request(`/visitors/${id}?societyId=${societyId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteVisitor: (societyId, id) => request(`/visitors/${id}?societyId=${societyId}`, { method: "DELETE" })
};
