import { useEffect, useState } from "react";
import { getClubs } from "@/services/clubs.service";
import { mapClubToSearchItem } from "@/mappers/club.mapper";
import { ClubSearchItem, EventSearchItem } from "./types";
import { getEvents } from "@/services/events.service";
import { mapEventToSearchItem } from "@/mappers/event.mapper";
import { useLocation } from "@/context/LocationContext";
import { getSports, getSportsMap } from "@/services/sports.service";

export const useSearch = (
  query?: string,
  radius?: number,
  useRadius?: boolean,
  city?: string,
  mapCoords?: { latitude: number; longitude: number },
  sportQuery?: string
) => {
  const { location } = useLocation();

  const [clubs, setClubs] = useState<ClubSearchItem[]>([]);
  const [events, setEvents] = useState<EventSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Suivi de la pagination
  const [eventsPage, setEventsPage] = useState(1);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  
  const [clubsPage, setClubsPage] = useState(1);
  const [hasMoreClubs, setHasMoreClubs] = useState(true);

  // Fonction principale (Reset et charge la page 1)
  const resolveSportId = async (): Promise<number | null | undefined> => {
    const normalized = sportQuery?.trim();
    if (!normalized) return undefined;

    const results = await getSports({ activite: normalized });
    if (!results.length) return null;

    const exact = results.find((sport) => sport.name.toLowerCase() === normalized.toLowerCase());
    return (exact || results[0]).id;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setEventsPage(1);
      setClubsPage(1);

      const resolvedSportId = await resolveSportId();
      const params = buildParams(1, resolvedSportId ?? undefined);

      const [clubsRes, eventsRes, sportsById] = await Promise.all([
        getClubs(params),
        resolvedSportId === null ? Promise.resolve({ data: [], pagination: { totalPages: 0 } }) : getEvents(params),
        getSportsMap(),
      ]);

      const mappedClubs = clubsRes.data.map(mapClubToSearchItem);
      const mappedEvents = eventsRes.data.map((event: any) => mapEventToSearchItem(event, sportsById));

      setClubs(mappedClubs);
      setEvents(mappedEvents);

      // Vérification des pages totales
      setHasMoreEvents(eventsRes.pagination?.totalPages > 1);
      setHasMoreClubs(clubsRes.pagination?.totalPages > 1);
    } catch (err) {
      console.error("Erreur fetch initial:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper pour construire les paramètres d'API
  const buildParams = (pageNumber: number, sportId?: number) => {
    const fallbackLocation = location ?? { latitude: 48.8566, longitude: 2.3522 };
    return {
      nameQuery: query || undefined,
      city: city || undefined,
      limit: 20,
      page: pageNumber,
      latitude: mapCoords?.latitude ?? fallbackLocation.latitude,
      longitude: mapCoords?.longitude ?? fallbackLocation.longitude,
      radiusInKm: useRadius ? radius : 1500,
      sportId,
    };
  };

  // Fonction pour charger la page SUIVANTE des Événements
  const fetchMoreEvents = async () => {
    if (loading || loadingMore || !hasMoreEvents) return;

    try {
      setLoadingMore(true);
      const nextPage = eventsPage + 1;
      const resolvedSportId = await resolveSportId();
      if (resolvedSportId === null) {
        setHasMoreEvents(false);
        return;
      }
      const params = buildParams(nextPage, resolvedSportId ?? undefined);

      const [eventsRes, sportsById] = await Promise.all([
        getEvents(params),
        getSportsMap(),
      ]);
      const mappedEvents = eventsRes.data.map((event: any) => mapEventToSearchItem(event, sportsById));

      if (mappedEvents.length > 0) {
        setEvents(prev => [...prev, ...mappedEvents]); // On ajoute à la suite
        setEventsPage(nextPage);
      }
      
      setHasMoreEvents(nextPage < eventsRes.pagination?.totalPages);
    } catch (err) {
      console.error("Erreur chargement pages suivantes événements:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Déclencheur automatique lors des changements de filtres / query
  useEffect(() => {
    fetchData();
  }, [query, radius, useRadius, city, sportQuery, mapCoords?.latitude, mapCoords?.longitude, location?.latitude, location?.longitude]);

  return { 
    clubs, 
    events, 
    loading, 
    loadingMore,
    refresh: fetchData, 
    fetchMoreEvents,
    hasMoreEvents
  };
};