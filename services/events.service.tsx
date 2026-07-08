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

export const likeEvent = async (eventId: string) => {
  const response = await api.post(`/events/${eventId}/like`);
  return response.data;
}

export const unlikeEvent = async (eventId: string) => {
  const response = await api.delete(`/events/${eventId}/like`);
  return response.data;
}

export const saveEvent = async (eventId: string) => {
  const response = await api.post(`/events/${eventId}/save`);
  return response.data;
}

export const unsaveEvent = async (eventId: string) => {
  const response = await api.delete(`/events/${eventId}/save`);
  return response.data;
}

export const getLikedEvents = async () => {
  const response = await api.get(`/events/likes/user`);
  console.log("Response from getLikedEvents:", response.data); // Log the response data
  return response.data;
}

export const getSavedEvents = async () => {
  const response = await api.get(`/events/saves/user`);
  return response.data;
}