import api from "./api";

interface EventQueryParams {
  q?: string;
  type?: string;
  city?: string;
  sportId?: number;
  radiusInKm?: number;
  longitude?: number;
  latitude?: number;
  per_page?: number;
  limit?: number;
  page?: number;
}

export async function getEvents(params?: EventQueryParams) {
  const cleanParams: any = {};

  if (params?.q) cleanParams.q = params.q;
  if (params?.type) cleanParams.type = params.type;
  if (params?.city) cleanParams.city = params.city;
  if (params?.sportId !== undefined) cleanParams.sportId = params.sportId.toString();
  if (params?.per_page) cleanParams.per_page = params.per_page.toString();
  if (!params?.per_page && params?.limit) cleanParams.per_page = params.limit.toString();
  if (params?.page) cleanParams.page = params.page.toString();
  if (params?.latitude !== undefined) cleanParams.latitude = params.latitude.toString();
  if (params?.longitude !== undefined) cleanParams.longitude = params.longitude.toString();
  if (params?.radiusInKm !== undefined) cleanParams.radiusInKm = params.radiusInKm.toString();

  const res = await api.get("/events", { params: cleanParams });
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

export const getEventsByClubId = async (
  clubId: string,
  params?: {
    latitude?: number;
    longitude?: number;
    radiusInKm?: number;
  }
) => {
  const requestParams: any = { clubId };

  if (params?.latitude !== undefined) requestParams.latitude = params.latitude;
  if (params?.longitude !== undefined) requestParams.longitude = params.longitude;
  if (params?.radiusInKm !== undefined) requestParams.radiusInKm = params.radiusInKm;

  const response = await api.get(`/events`, {
    params: requestParams,
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
  return response.data;
}

export const getSavedEvents = async () => {
  const response = await api.get(`/events/saves/user`);
  return response.data;
}

export const getEventStatus = async (eventId: string) => {
  const response = await api.get(`/events/${eventId}/status`);
  return response.data;
}

export const getEventsLikeCount = async (eventId: string) => {
  const response = await api.get(`/events/${eventId}/likes/count`);
  return response.data;
}

export const participateInEvent = async (eventId: string) => {
  const response = await api.post(`/events/${eventId}/participate`);
  return response.data;
}

export const unparticipateInEvent = async (eventId: string) => {
  const response = await api.delete(`/events/${eventId}/participate`);
  return response.data;
}

export const getParticipatingEvents = async () => {
  const response = await api.get(`/events/my-participations`);
  return response.data;
}