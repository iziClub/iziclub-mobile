import api from "./api";

export const getNotifications = async () => {
  const response = await api.get(`/clubs/me/announcements`);
  return response.data;
}

export const markNotificationAsRead = async (notificationId: string) => {
  const response = await api.post(`/clubs/me/announcements/${notificationId}/read`);
  return response.data;
}

export const getNotificationById = async (notificationId: string) => {
  const response = await api.get(`/clubs/announcements/${notificationId}`);
  return response.data;
}