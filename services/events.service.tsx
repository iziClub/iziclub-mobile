import api from "./api";
import { Event } from "../types/event";

export interface EventsResponse {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    links: {
      first: string | null;
      last: string | null;
      next: string | null;
      prev: string | null;
    };
  };
  data: Event[];
}

export interface EventStatus {
  isLiked: boolean;
  isSaved: boolean;
  isParticipating: boolean;
}

export interface EventRelationRecord {
  id: string;
  userId: string;
  eventId: string;
  createdAt: string;
}

export interface EventRelationListResponse {
  data: EventRelationRecord[];
  meta: {
    total: number;
    currentPage: number;
    perPage: number;
    lastPage: number;
    firstPageUrl: string;
    lastPageUrl: string;
    nextPageUrl: string | null;
    previousPageUrl: string | null;
  };
}

export interface MyParticipationsResponse {
  data: {
    id: string;
    userId: string;
    eventId: string;
    event?: {
      id?: string;
      title?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      location?: {
        street?: string;
        city?: string;
        zipCode?: string;
        latitude?: number;
        longitude?: number;
      };
      coverUrl?: string | null;
      isArchived?: boolean;
      isPublished?: boolean;
    };
    createdAt: string;
  }[];
  meta: { total: number; currentPage: number; perPage: number; lastPage: number };
}

interface EventQueryParams {
  nameQuery?: string;
  eventType?: string;
  city?: string;
  sportId?: number;
  radiusInKm?: number;
  longitude?: number;
  latitude?: number;
  limit?: number;
  page?: number;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getEvents(params?: EventQueryParams): Promise<EventsResponse> {
  const cleanParams: Record<string, string | number> = {};

  if (params?.nameQuery) cleanParams.nameQuery = params.nameQuery;
  if (params?.eventType) cleanParams.eventType = params.eventType;
  if (params?.city) cleanParams.city = params.city;
  if (params?.sportId !== undefined) cleanParams.sportId = params.sportId;
  if (params?.limit !== undefined) cleanParams.limit = params.limit;
  if (params?.page !== undefined) cleanParams.page = params.page;
  if (params?.date !== undefined) cleanParams.date = params.date;
  if (params?.dateFrom !== undefined) cleanParams.dateFrom = params.dateFrom;
  if (params?.dateTo !== undefined) cleanParams.dateTo = params.dateTo;
  if (params?.latitude !== undefined) cleanParams.latitude = params.latitude;
  if (params?.longitude !== undefined) cleanParams.longitude = params.longitude;
  if (params?.radiusInKm !== undefined) cleanParams.radiusInKm = params.radiusInKm;

  const res = await api.get("/events", { params: cleanParams });
  return res.data;
}

export const getEventById = async (id: string): Promise<Event> => {
  const response = await api.get(`/events`,
    {
      params: { eventId: id }
    }
  );
  const event = response.data.data as Event | undefined;
  console.log("Fetched event:", response.data.data);
  if (!event) throw new Error(`Event ${id} was not found`);
  return event;
}

export const getEventsByClubId = async (
  clubId: string,
  params?: {
    latitude?: number;
    longitude?: number;
    radiusInKm?: number;
    page?: number;
    limit?: number;
  }
): Promise<EventsResponse> => {
  const requestParams: Record<string, string | number> = { clubId };

  if (params?.latitude !== undefined) requestParams.latitude = params.latitude;
  if (params?.longitude !== undefined) requestParams.longitude = params.longitude;
  if (params?.radiusInKm !== undefined) requestParams.radiusInKm = params.radiusInKm;
  if (params?.page !== undefined) requestParams.page = params.page;
  if (params?.limit !== undefined) requestParams.limit = params.limit;

  const response = await api.get(`/events`, {
    params: requestParams,
  });
  return response.data;
}

export const likeEvent = async (eventId: string): Promise<EventRelationRecord> => {
  const response = await api.post(`/events/${eventId}/like`);
  return response.data;
}

export const unlikeEvent = async (eventId: string): Promise<void> => {
  await api.delete(`/events/${eventId}/like`);
}

export const saveEvent = async (eventId: string): Promise<EventRelationRecord> => {
  const response = await api.post(`/events/${eventId}/save`);
  return response.data;
}

export const unsaveEvent = async (eventId: string): Promise<void> => {
  await api.delete(`/events/${eventId}/save`);
}

export const getLikedEvents = async (): Promise<EventRelationListResponse> => {
  const response = await api.get(`/events/likes/user`);
  return response.data;
}

export const getSavedEvents = async (): Promise<EventRelationListResponse> => {
  const response = await api.get(`/events/saves/user`);
  return response.data;
}

export const getEventStatus = async (eventId: string): Promise<EventStatus> => {
  const response = await api.get(`/events/${eventId}/status`);
  return response.data;
}

export const getEventsLikeCount = async (eventId: string): Promise<{ count: number }> => {
  const response = await api.get(`/events/${eventId}/likes/count`);
  return response.data;
}

export const participateInEvent = async (eventId: string): Promise<EventRelationRecord> => {
  const response = await api.post(`/events/${eventId}/participate`);
  return response.data;
}

export const unparticipateInEvent = async (eventId: string): Promise<void> => {
  await api.delete(`/events/${eventId}/participate`);
}

export const getParticipatingEvents = async (): Promise<MyParticipationsResponse> => {
  const response = await api.get(`/events/my-participations`);
  return response.data;
}