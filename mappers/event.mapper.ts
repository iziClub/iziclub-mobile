import { EventSearchItem } from "@/components/search/types";
import { Event as ApiEvent } from "@/types/event";

export const mapEventToSearchItem = (
  event: ApiEvent,
  sportsById?: Record<number, { name: string }>
): EventSearchItem => {
  const startDateValue = event.startDate;
  const endDateValue = event.endDate;
  const startDate = startDateValue ? new Date(startDateValue) : null;
  const resolvedSport = sportsById?.[event.sportId]?.name ?? null;
  const resolvedType = event.eventType || "event";
  const resolvedPricing = event.price;
  const resolvedImage = event.coverImagePath;

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
    tags: [resolvedType],
    clubId: event.clubId,
    distanceInKm: event.distanceInKm ?? undefined,
    coverImagePath: resolvedImage,
  };
};

// Petite fonction helper pour l'heure (à mettre dans un fichier utils si besoin)
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
};