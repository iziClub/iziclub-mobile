export interface PartnerClub {
  id: string;
  name: string;
  profileImagePath?: string | null;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  sport: string | null;
  type: string;
  latitude: string;
  longitude: string;
  imageUrl: string | undefined;
  startDate: string | null;
  endDate: string | null;
  price: string | null;
  eventDate: string | null;
  distanceInKm?: number; // en km, optionnel
  tags?: string[]; // ex: ["Tournoi", "Gratuit"]
  clubId: string;
  address: {
    street: string;
    city: string;
    longitude: string;
    latitude: string;
  };
  banner_url: string;
  partnerClubs?: PartnerClub[];
  status?: {
    isLiked: boolean;
    isSaved: boolean;
    isParticipating: boolean;
    countLikes: number; // Ajout du nombre de likes
  };
}
