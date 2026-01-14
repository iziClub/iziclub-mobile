import api from "./api";
import { MOCK_CLUBS } from "../mocks/club.mocks";

interface ClubQueryParams {
  q?: string;
  type?: string;
  city?: string;
  radius_km?: number;
  longitude?: number;
  latitude?: number;
  per_page?: number;
  page?: number;
}

export async function getClubs(params?: ClubQueryParams) {
  const res = await api.get("/clubs", { params });
  return res.data;
}

export const getClubById = async (id: number) => {
  await new Promise((r) => setTimeout(r, 500));

  return MOCK_CLUBS.find((c) => c.id === id);
};
