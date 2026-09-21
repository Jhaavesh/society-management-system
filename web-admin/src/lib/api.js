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
  dashboard: (societyId) => request(`/dashboard/${societyId}?societyId=${societyId}`),
  buildings: (societyId) => request(`/buildings?societyId=${societyId}`),
  flats: (societyId, buildingId = "") => request(`/flats?societyId=${societyId}${buildingId ? `&buildingId=${buildingId}` : ""}`),
  residents: (societyId) => request(`/residents?societyId=${societyId}`),
  bills: (societyId) => request(`/maintenance?societyId=${societyId}`),
  complaints: (societyId) => request(`/complaints?societyId=${societyId}`),
  notices: (societyId) => request(`/notices?societyId=${societyId}`),
  visitors: (societyId) => request(`/visitors?societyId=${societyId}`)
};
