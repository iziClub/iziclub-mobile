export interface Message {
  id: string;
  clubName: string;
  sentTo: string;
  title: string;
  content: string;
  date: string;
  isUnread: boolean;
  isUrgent?: boolean;
};
