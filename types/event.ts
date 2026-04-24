export interface Event {
  id: string;
  name: string;
    description: string;
    sport: string | null;
    type: string;
    latitude: string;
    longitude: string;
    imageUrl: string | undefined;
    starts_at: string | null;
    ends_at: string | null;
    pricing: string | null;
    distance_km?: number; // en km, optionnel
    tags?: string[]; // ex: ["Tournoi", "Gratuit"]
    club_id: string;
    address: {
        street: string;
        city: string;
    }
}
