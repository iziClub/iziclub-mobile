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
    distance_km?: number; // en km, optionnel
    tags?: string[]; // ex: ["Tournoi", "Gratuit"]
    clubId: string;
    address: {
        street: string;
        city: string;
    }
    banner_url: string;
    status?: {
        isLiked: boolean;
        isSaved: boolean;
        isParticipating: boolean;
        countLikes: number; // Ajout du nombre de likes
    }
}
