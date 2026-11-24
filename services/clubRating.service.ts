import api from "./api";

export interface ClubRating {
  id: string;
  clubId: string;
  score: number;
}

/** Ma note pour ce club, ou `null` si je ne l'ai pas encore noté. Réservé aux membres du club. */
export const getMyClubRating = async (clubId: string): Promise<ClubRating | null> => {
  const response = await api.get(`/clubs/${clubId}/rating`);
  return response.data?.data ?? null;
};

/** Enregistre ma note (1 à 5) : création la première fois, modification ensuite. */
export const saveMyClubRating = async (clubId: string, score: number, alreadyRated: boolean): Promise<ClubRating> => {
  const response = alreadyRated
    ? await api.patch(`/clubs/${clubId}/rating`, { score })
    : await api.post(`/clubs/${clubId}/rating`, { score });
  return response.data.data;
};
