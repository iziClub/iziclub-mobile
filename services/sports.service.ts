import api from "./api";

export interface Sport {
  id: number;
  name: string;
  family: string;
  code: string;
}

interface GetSportsParams {
  activite?: string;
  famille?: string;
}

let sportsCache: Sport[] | null = null;

export const getSports = async (params?: GetSportsParams): Promise<Sport[]> => {
  const cleanParams: any = {};
  if (params?.activite) cleanParams.activite = params.activite;
  if (params?.famille) cleanParams.famille = params.famille;

  const response = await api.get("/sports", { params: cleanParams });
  return response.data;
};

export const getSportsCached = async (): Promise<Sport[]> => {
  if (sportsCache) return sportsCache;
  sportsCache = await getSports();
  return sportsCache;
};

export const getSportsMap = async (): Promise<Record<number, Sport>> => {
  const sports = await getSportsCached();
  return sports.reduce<Record<number, Sport>>((acc, sport) => {
    acc[sport.id] = sport;
    return acc;
  }, {});
};

export const getSportById = async (sportId?: number | null): Promise<Sport | null> => {
  if (!sportId) return null;
  const sportsById = await getSportsMap();
  return sportsById[sportId] ?? null;
};
