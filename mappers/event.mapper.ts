import { EventSearchItem } from "@/components/search/types";

// Interface basée sur ton JSON de réponse
export interface ApiEvent {
  id: string;
  name: string;
  sport: string | null;
  sportId?: number;
  eventType?: string | null;
  address: {
    city: string | null;
    street: string | null;
    latitude: string | number | null;
    longitude: string | number | null;
  };
  starts_at: string | null;
  startDate?: string | null;
  endDate?: string | null;
  banner_url: string | null;
  coverImagePath?: string | null;
  pricing: string | null;
  price?: string | null;
  tags?: string[];
  clubId: string;
  distanceInKm?: number; // Ajout de la distance ici pour le mapping
}

export const mapEventToSearchItem = (
  event: ApiEvent,
  sportsById?: Record<number, { name: string }>
): EventSearchItem => {
  const startDateValue = event.starts_at || event.startDate || null;
  const endDateValue = event.endDate || null;
  const startDate = startDateValue ? new Date(startDateValue) : null;
  const resolvedSport =
    event.sport ||
    (event.sportId ? sportsById?.[event.sportId]?.name ?? null : null);
  const resolvedType = event.eventType || "event";
  const resolvedPricing = event.pricing || event.price || null;
  const resolvedImage = event.coverImagePath || event.banner_url || null;

  return {
    id: event.id,
    name: event.name || "Événement sans nom",
    type: "event",
    city: event.address.city || "Lieu non précisé",
    street: event.address.street || "Adresse non précisée",
    sport: resolvedSport,
    starts_at: startDateValue,
    ends_at: endDateValue,
    pricing: resolvedPricing,
    day: startDate ? startDate.getDate().toString() : "N/A",
    month: startDate ? startDate.toLocaleString('fr-FR', { month: 'short' }) : "N/A",
    image: resolvedImage,
    latitude: String(event.address?.latitude ?? "0"),
    longitude: String(event.address?.longitude ?? "0"),
    tags: event.tags || [resolvedType].filter(Boolean),
    clubId: event.clubId,
    distanceInKm: event.distanceInKm, // Ajout de la distance au mapping
    coverImagePath: resolvedImage,
  };
};

// Petite fonction helper pour l'heure (à mettre dans un fichier utils si besoin)
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
};