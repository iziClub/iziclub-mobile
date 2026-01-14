import api from "./api";

interface EventQueryParams {
  q?: string;
  type?: string;
  city?: string;
  radius_km?: number;
  longitude?: number;
  latitude?: number;
  per_page?: number;
  page?: number;
}

export async function getEvents(params?: EventQueryParams) {
  const res = await api.get("/events", { params });
  return res.data;
}
