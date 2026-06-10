export interface BaseSearchItem {
  id: string;
  name: string;
  city: string;
  street: string;
  latitude: string;
  longitude: string;
  image: string | null;
  distance_km?: number; // Ajout de la distance ici pour les deux types
}

export interface ClubSearchItem extends BaseSearchItem {
  type: 'club';
  sport: string | null;
  // category: string; // ex: "Tennis"
}

export interface EventSearchItem extends BaseSearchItem {
  type: 'event';
  sport: string | null;
  starts_at: string | null;
  ends_at: string | null;
  pricing: string | null;
  tags?: string[];
  // Champs formatés pour la vue
  day: string;
  month: string;
  clubId: string;
  banner_url: string | null;
}

export type SearchItem = ClubSearchItem | EventSearchItem;