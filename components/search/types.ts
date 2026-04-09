// La base commune pour n'importe quel élément de recherche
export interface BaseSearchItem {
  id: string;
  name: string;
  city: string;
  street: string;
  latitude: string;
  longitude: string;
  image: string | null;
}

// Spécifique aux Clubs
export interface ClubSearchItem extends BaseSearchItem {
  type: 'club';
  sport: string | null;
  // category: string; // ex: "Tennis"
}

// Spécifique aux Événements
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
}

// Le type union pour tes listes de recherche
export type SearchItem = ClubSearchItem | EventSearchItem;