export interface Message {
  id: string;
  clubId?: string;
  clubName: string;
  sentTo: string;
  title: string;
  content: string;
  date: string;
  createdAt?: string;
  isUnread: boolean;
  isUrgent?: boolean;
};
