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

export const getEventById = async (id: string) => {
  const response = await api.get(`/events/${id}`);
  return response.data;
}

export const getEventsByClubId = async (clubId: string) => {
  const response = await api.get(`/clubs/${clubId}/events`);
  return response.data;
}
