// import api from "./api";
// import { MOCK_CLUBS } from "../mocks/club.mocks";

// interface ClubQueryParams {
//   q?: string;
//   type?: string;
//   city?: string;
//   radius_km?: number;
//   longitude?: number;
//   latitude?: number;
//   per_page?: number;
//   page?: number;
// }

// export async function getClubs(params?: ClubQueryParams) {
//   const res = await api.get("/clubs", { params });
//   return res.data;
// }

// // export const getClubById = async (id: number) => {
// //   await new Promise((r) => setTimeout(r, 500));

// //   return MOCK_CLUBS.find((c) => c.id === id);
// // };

// const fetchClubs = async () => {
//   try {
//     const clubs = await api.get('clubs'); // Pas besoin de .data ici, c'est déjà géré !
//     console.log(clubs);
//   } catch (err) {
//     console.error(err);
//   }
// };

// import api from "./api";
// import { ClubsResponse } from '../types/club';

// export const getClubs = async (): Promise<ClubsResponse> => {
//   const response = await api.get('/clubs');
//   return response.data;
// };

// src/api/clubs.api.ts

import api from "./api";
import { ClubsResponse } from "../types/club";

interface GetClubsParams {
  search?: string;
  page?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  city?: string;
}

export const getClubs = async (
  params?: GetClubsParams // 👈 IMPORTANT
): Promise<ClubsResponse> => {

  const cleanParams: any = {};

  if (params?.search) cleanParams.search = params.search;
  if (params?.page) cleanParams.page = params.page.toString();
  if (params?.limit) cleanParams.limit = params.limit.toString();
  if (params?.latitude) cleanParams.latitude = params.latitude.toString();
  if (params?.longitude) cleanParams.longitude = params.longitude.toString();
  if (params?.radius) cleanParams.radius = params.radius.toString();
  if (params?.city) cleanParams.city = params.city;

  const response = await api.get("/clubs", {
    params: cleanParams,
  });

  return response.data;
};
