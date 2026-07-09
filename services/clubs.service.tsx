import api from "./api";
import { ClubsResponse } from "../types/club";

interface GetClubsParams {
  nameQuery?: string;
  page?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
  radiusInKm?: number;
  city?: string;
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
  console.log("Request params for getClubs:", cleanParams); // Log the request parameters
  // console.log("Response from getClubs:", response.data); // Log the response data
  return response.data;
};

export const getClubById = async (id: string) => {
  const response = await api.get(`/clubs`, {
    params: { clubId: id },
  });
  console.log(`Request params for getClubById (id: ${id}):`, { clubId: id }); // Log the request parameters
  console.log(`Response from getClubById (id: ${id}):`, response.data); // Log the response data
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
  console.log("Response from getLikedClubs:", response.data); // Log the response data
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
