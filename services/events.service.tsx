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
  const response = await api.get(`/events`,
    {
      params: { eventId: id }
    }
  );
  return response.data.data;
}

export const getEventsByClubId = async (clubId: string) => {
  const response = await api.get(`/events`, {
    params: { clubId, longitude: 2.363616001901619, latitude: 48.85712301088664, radius_km: 50 }
  });
  return response.data;
}
