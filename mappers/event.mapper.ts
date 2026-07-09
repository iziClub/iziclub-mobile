import { EventSearchItem } from "@/components/search/types";

// Interface basée sur ton JSON de réponse
export interface ApiEvent {
  id: string;
  name: string;
  sport: string | null;
  address: {
    city: string | null;
    street: string | null;
    latitude: string | null;
    longitude: string | null;
  };
  starts_at: string | null;
  banner_url: string | null;
  pricing: string | null;
  tags?: string[];
  clubId: string;
  distanceInKm?: number; // Ajout de la distance ici pour le mapping
}

export const mapEventToSearchItem = (event: ApiEvent): EventSearchItem => {
  const startDate = event.starts_at ? new Date(event.starts_at) : null;

  return {
    id: event.id,
    name: event.name || "Événement sans nom",
    type: "event",
    city: event.address.city || "Lieu non précisé",
    street: event.address.street || "Adresse non précisée",
    sport: event.sport,
    starts_at: event.starts_at,
    ends_at: null, // Si tu as une date de fin, mappe-la ici
    pricing: event.pricing,
    day: startDate ? startDate.getDate().toString() : "N/A",
    month: startDate ? startDate.toLocaleString('fr-FR', { month: 'short' }) : "N/A",
    image: event.banner_url, // Utilise le banner_url comme image de l'événement    
    latitude: String(event.address?.latitude ?? "0"),
    longitude: String(event.address?.longitude ?? "0"),
    tags: event.tags || [],
    clubId: event.clubId,
    distanceInKm: event.distanceInKm, // Ajout de la distance au mapping
  };
};

// Petite fonction helper pour l'heure (à mettre dans un fichier utils si besoin)
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
};