import api from "./api";
import { Category, ClubsResponse, MemberClubsResponse, Session } from "../types/club";
import { Form } from "../types/forms";

interface GetClubsParams {
  nameQuery?: string;
  sportId?: number;
  page?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
  radiusInKm?: number;
  city?: string;
}

interface GetClubByIdParams {
  latitude?: number;
  longitude?: number;
  radiusInKm?: number;
}

export interface ClubRelationRecord {
  id: string;
  userId: string;
  clubId: string;
  createdAt: string;
}

export interface RelationMeta {
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
  firstPageUrl: string;
  lastPageUrl: string;
  nextPageUrl: string | null;
  previousPageUrl: string | null;
}

export interface ClubRelationListResponse {
  data: ClubRelationRecord[];
  meta: RelationMeta;
}

export interface ClubStatusResponse {
  isLiked: boolean;
  isSaved: boolean;
  isRegistered: boolean;
  hasActiveLicense: boolean;
}

export interface ClubGalleryResponse {
  data: { id: string; clubId: string; url: string }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  firstPageUrl: string;
  lastPageUrl: string;
  nextPageUrl: string | null;
  previousPageUrl: string | null;
}

export const getClubs = async (
  params?: GetClubsParams
): Promise<ClubsResponse> => {

  const cleanParams: Record<string, string | number> = {};

  if (params?.nameQuery) cleanParams.nameQuery = params.nameQuery;
  if (params?.sportId !== undefined) cleanParams.sportId = params.sportId;
  if (params?.page !== undefined) cleanParams.page = params.page;
  if (params?.limit !== undefined) cleanParams.limit = params.limit;
  if (params?.latitude !== undefined) cleanParams.latitude = params.latitude;
  if (params?.longitude !== undefined) cleanParams.longitude = params.longitude;
  if (params?.radiusInKm !== undefined) cleanParams.radiusInKm = params.radiusInKm;
  if (params?.city) cleanParams.city = params.city;

  const response = await api.get("/clubs", {
    params: cleanParams,
  });
  return response.data;
};

export const getClubById = async (id: string, params?: GetClubByIdParams): Promise<ClubsResponse> => {
  const cleanParams: Record<string, string | number> = { clubId: id };
  if (params?.latitude !== undefined) cleanParams.latitude = params.latitude;
  if (params?.longitude !== undefined) cleanParams.longitude = params.longitude;
  if (params?.radiusInKm !== undefined) cleanParams.radiusInKm = params.radiusInKm;

  const response = await api.get(`/clubs`, {
    params: cleanParams,
  });
  // Avec une position, l'API ne renvoie que les clubs situés dans le rayon :
  // un club sans adresse géolocalisée (ou trop loin) serait « introuvable »
  // alors qu'on le demande par son identifiant. On le redemande sans position.
  if (response.data?.data?.length === 0 && cleanParams.latitude !== undefined) {
    const fallback = await api.get(`/clubs`, { params: { clubId: id } });
    return fallback.data;
  }
  return response.data;
}

export const getGalleryImagesByClubId = async (
  clubId: string,
  params?: { page?: number; limit?: number }
): Promise<ClubGalleryResponse> => {
  const response = await api.get(`/clubs/${clubId}/profile/gallery`, { params });
  return response.data;
};


export const getLikedClubs = async (): Promise<ClubRelationListResponse> => {
  const response = await api.get(`/clubs/likes/user`);
  return response.data;
}

export const getCategoryByClubId = async (clubId: string): Promise<{ data: Category[] }> => {
  const response = await api.get(`/clubs/${clubId}/categories`);
  return response.data;
}

export const getSessionsByClubId = async (
  clubId: string,
  categoryId?: string
): Promise<{ data: Session[] }> => {
  const response = await api.get(`/clubs/${clubId}/sessions`, {
    params: categoryId ? { categoryId } : undefined,
  });
  return response.data;
}

export const likeClub = async (clubId: string): Promise<ClubRelationRecord> => {
  const response = await api.post(`/clubs/${clubId}/like`);
  return response.data;
}

export const unlikeClub = async (clubId: string): Promise<void> => {
  await api.delete(`/clubs/${clubId}/like`);
}

export const saveClub = async (clubId: string): Promise<ClubRelationRecord> => {
  const response = await api.post(`/clubs/${clubId}/save`);
  return response.data;
}

export const unsaveClub = async (clubId: string): Promise<void> => {
  await api.delete(`/clubs/${clubId}/save`);
}

export const getSavedClubs = async (): Promise<ClubRelationListResponse> => {
  const response = await api.get(`/clubs/saves/user`);
  return response.data;
}

export const getMemberClubs = async (): Promise<MemberClubsResponse> => {
  const response = await api.get(`/member/me/clubs`);
  return response.data;
}

export const getClubStatus = async (clubId: string): Promise<ClubStatusResponse> => {
  const response = await api.get(`/clubs/${clubId}/status`);
  return response.data;
}

export const getClubsLikeCount = async (clubId: string): Promise<{ count: number }> => {
  const response = await api.get(`/clubs/${clubId}/likes/count`);
  return response.data;
}

export const getClubForm = async (clubId: string): Promise<{ message: string; data: Form }> => {
  const response = await api.get(`/clubs/${clubId}/forms/active`);
  return response.data;
}
