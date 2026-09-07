import api from "./api";
import { ClubsResponse, Club } from "../types/club";

interface GetClubsParams {
  nameQuery?: string;
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

export interface MemberClubsResponse {
  data: Club[];
}

export const getClubs = async (
  params?: GetClubsParams // 👈 IMPORTANT
): Promise<ClubsResponse> => {

  const cleanParams: any = {};

  if (params?.nameQuery) cleanParams.nameQuery = params.nameQuery;
  if (params?.page) cleanParams.page = params.page.toString();
  if (params?.limit) cleanParams.limit = params.limit.toString();
  if (params?.latitude) cleanParams.latitude = params.latitude.toString();
  if (params?.longitude) cleanParams.longitude = params.longitude.toString();
  if (params?.radiusInKm) cleanParams.radiusInKm = params.radiusInKm.toString();
  if (params?.city) cleanParams.city = params.city;

  const response = await api.get("/clubs", {
    params: cleanParams,
  });
  return response.data;
};

export const getClubById = async (id: string, params?: GetClubByIdParams) => {
  const latitude = params?.latitude ?? 48.8566;
  const longitude = params?.longitude ?? 2.3522;
  const radiusInKm = params?.radiusInKm ?? 1500;

  const cleanParams = {
    clubId: id,
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    radiusInKm: radiusInKm.toString(),
  };

  const response = await api.get(`/clubs`, {
    params: cleanParams,
  });
  return response.data;
}

export const getGalleryImagesByClubId = async (clubId: string) => {
  const response = await api.get(`/clubs/${clubId}/profile/gallery`, {
    params: { clubId },
  });
  return response.data;
};


export const getLikedClubs = async () => {
  const response = await api.get(`/clubs/likes/user`);
  return response.data;
}

export const getCategoryByClubId = async (clubId: string) => {
  const response = await api.get(`/clubs/${clubId}/categories`);
  return response.data;
}

export const getSessionsByClubId = async (clubId: string) => {
  const response = await api.get(`/clubs/${clubId}/sessions`);
  return response.data;
}

export const likeClub = async (clubId: string) => {
  const response = await api.post(`/clubs/${clubId}/like`);
  return response.data;
}

export const unlikeClub = async (clubId: string) => {
  const response = await api.delete(`/clubs/${clubId}/like`);
  return response.data;
}

export const saveClub = async (clubId: string) => {
  const response = await api.post(`/clubs/${clubId}/save`);
  return response.data;
}

export const unsaveClub = async (clubId: string) => {
  const response = await api.delete(`/clubs/${clubId}/save`);
  return response.data;
}

export const getSavedClubs = async () => {
  const response = await api.get(`/clubs/saves/user`);
  return response.data;
}

export const getMemberClubs = async (): Promise<MemberClubsResponse> => {
  const response = await api.get(`/member/me/clubs`);
  return response.data;
}

export const getClubStatus = async (clubId: string) => {
  const response = await api.get(`/clubs/${clubId}/status`);
  return response.data;
}

export const getClubsLikeCount = async (clubId: string) => {
  const response = await api.get(`/clubs/${clubId}/likes/count`);
  return response.data;
}

export const getClubForm = async (clubId: string) => {
  const response = await api.get(`/clubs/${clubId}/forms/active`);
  return response.data;
}
