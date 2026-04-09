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
}

export const mapEventToSearchItem = (event: ApiEvent): EventSearchItem => {
  const startDate = event.starts_at ? new Date(event.starts_at) : null;

  return {
    id: event.id,
    name: event.name || "Événement sans nom",
    type: "event",
    city: event.address?.city || "Lieu non précisé",
    street: event.address.street || "Adresse non précisée",
    sport: event.sport,
    starts_at: event.starts_at,
    ends_at: null, // Si tu as une date de fin, mappe-la ici
    pricing: event.pricing,
    tags: [], // Si tu as des tags, mappe-les ici
    day: startDate ? startDate.getDate().toString() : "N/A",
    month: startDate ? startDate.toLocaleString('fr-FR', { month: 'short' }) : "N/A",
    image: event.banner_url, // Utilise le banner_url comme image de l'événement    
    // Correction ici : On force la conversion en string
    // On gère aussi le cas où c'est null avec un fallback à "0"
    latitude: String(event.address?.latitude ?? "0"),
    longitude: String(event.address?.longitude ?? "0"),
  };
};

// Petite fonction helper pour l'heure (à mettre dans un fichier utils si besoin)
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
};