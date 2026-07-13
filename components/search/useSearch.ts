import { useEffect, useState } from "react";
import { getClubs } from "@/services/clubs.service";
import { mapClubToSearchItem } from "@/mappers/club.mapper";
import { ClubSearchItem, EventSearchItem } from "./types";
import { getEvents } from "@/services/events.service";
import { mapEventToSearchItem } from "@/mappers/event.mapper";
import { useLocation } from "@/context/LocationContext";

export const useSearch = (
  query?: string,
  radius?: number,
  useRadius?: boolean,
  city?: string,
  mapCoords?: { latitude: number; longitude: number }
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
  const fetchData = async () => {
    try {
      setLoading(true);
      setEventsPage(1);
      setClubsPage(1);

      const params = buildParams(1);

      const [clubsRes, eventsRes] = await Promise.all([
        getClubs(params),
        getEvents(params)
      ]);

      const mappedClubs = clubsRes.data.map(mapClubToSearchItem);
      const mappedEvents = eventsRes.data.map(mapEventToSearchItem);

      setClubs(mappedClubs);
      setEvents(mappedEvents);

      // Vérification des pages totales
      setHasMoreEvents(clubsRes.pagination?.totalPages > 1);
      setHasMoreClubs(eventsRes.pagination?.totalPages > 1);
    } catch (err) {
      console.error("Erreur fetch initial:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper pour construire les paramètres d'API
  const buildParams = (pageNumber: number) => {
    const fallbackLocation = location ?? { latitude: 48.8566, longitude: 2.3522 };
    return {
      nameQuery: query || undefined,
      city: city || undefined,
      limit: 20,
      page: pageNumber,
      latitude: mapCoords?.latitude ?? fallbackLocation.latitude,
      longitude: mapCoords?.longitude ?? fallbackLocation.longitude,
      radiusInKm: useRadius ? radius : 1500,
    };
  };

  // Fonction pour charger la page SUIVANTE des Événements
  const fetchMoreEvents = async () => {
    if (loading || loadingMore || !hasMoreEvents) return;

    try {
      setLoadingMore(true);
      const nextPage = eventsPage + 1;
      const params = buildParams(nextPage);

      const eventsRes = await getEvents(params);
      const mappedEvents = eventsRes.data.map(mapEventToSearchItem);

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
  }, [query, radius, useRadius, city, mapCoords?.latitude, mapCoords?.longitude, location?.latitude, location?.longitude]);

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