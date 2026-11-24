import api from "./api";

export interface ClubNotificationPreferences {
  clubId: string;
  /** Annonces du club */
  announcements: boolean;
  /** Actualités des événements (changement de date, annulation...) */
  eventUpdates: boolean;
}

export const getClubNotificationPreferences = async (clubId: string): Promise<ClubNotificationPreferences> => {
  const response = await api.get(`/clubs/${clubId}/notification-preferences`);
  return response.data.data;
};

export const updateClubNotificationPreferences = async (
  clubId: string,
  changes: Partial<Pick<ClubNotificationPreferences, "announcements" | "eventUpdates">>
): Promise<ClubNotificationPreferences> => {
  const response = await api.patch(`/clubs/${clubId}/notification-preferences`, changes);
  return response.data.data;
};
