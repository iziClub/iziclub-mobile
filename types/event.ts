export interface PartnerClub {
  id: string;
  name: string;
  profileImagePath?: string | null;
}

export interface Event {
  id: string;
  clubId: string;
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  };
  eventDate: string;
  startDate: string;
  endDate: string;
  price: string;
  sportId: number;
  eventType: string;
  coverImagePath: string | null;
  isArchived: boolean;
  isPublished: boolean;
  createdFromEventId: string | null;
  createdAt: string;
  updatedAt: string | null;
  partnerClubs: PartnerClub[];
  isLiked?: boolean;
  isSaved?: boolean;
  isRegistered?: boolean;
  isParticipating?: boolean;
  distanceInKm?: number | null;
  status?: {
    isLiked?: boolean;
    isSaved?: boolean;
    isParticipating?: boolean;
    countLikes?: number;
  };
}
