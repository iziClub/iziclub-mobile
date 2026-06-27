import { useEffect, useState } from "react";
import { getClubs } from "@/services/clubs.service";
import { mapClubToSearchItem } from "@/mappers/club.mapper";
import { ClubSearchItem, EventSearchItem, SearchItem } from "./types";
import { getEvents } from "@/services/events.service";
import { mapEventToSearchItem } from "@/mappers/event.mapper";
import { USER_LOCATION } from "./data";

export const useSearch = (
  query: string,
  radius: number,
  useRadius: boolean,
  city: string,
  mapCoords?: { latitude: number; longitude: number }
) => {
  const [clubs, setClubs] = useState<ClubSearchItem[]>([]);
  const [events, setEvents] = useState<EventSearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const defaultLat = USER_LOCATION.latitude;
      const defaultLon = USER_LOCATION.longitude;

      const params: any = {
        search: query || undefined,
        city: city || undefined,
        limit: 20,
        page: 1,
      };

      if (useRadius) {
        params.latitude = mapCoords?.latitude ?? defaultLat;
        params.longitude = mapCoords?.longitude ?? defaultLon;
        params.radius = radius;
      }

      const [clubsRes, eventsRes] = await Promise.all([
        getClubs(params),
        getEvents(params)
      ]);
      const mappedClubs = clubsRes.data.map(mapClubToSearchItem);
      console.log("Mapped Clubs:", mappedClubs);
      const mappedEvents = eventsRes.data.map(mapEventToSearchItem);
      setClubs(mappedClubs);
      setEvents(mappedEvents);
    } catch (err) {
      console.error("Erreur fetch clubs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [query, radius, useRadius, city, mapCoords?.latitude, mapCoords?.longitude]);

  return { clubs, events, loading, refresh: fetchData };
};
