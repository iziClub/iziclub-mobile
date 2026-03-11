import { useState, useMemo } from "react";
import { clubs, events, USER_LOCATION } from "./data";

function distanceKm(lat1:number, lon1:number, lat2:number, lon2:number) {
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180) *
    Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2) *
    Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R*c;
}

export function useSearch(
  query: string,
  radius: number,
  useRadius: boolean,
  city: string
) {
  const results = useMemo(() => {
    const q = query.toLowerCase();

    const filteredClubs = clubs
      .map(c => {
        const d = distanceKm(
          USER_LOCATION.latitude,
          USER_LOCATION.longitude,
          c.latitude,
          c.longitude
        );
        return { ...c, distance: d };
      })
      .filter(c =>
        // Recherche sur le nom OU le type
        (c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)) &&
        (!useRadius || c.distance <= radius) &&
        (!city || c.city.toLowerCase().includes(city.toLowerCase()))
      );

    const filteredEvents = events
      .map(e => {
        const d = distanceKm(
          USER_LOCATION.latitude,
          USER_LOCATION.longitude,
          e.latitude,
          e.longitude
        );
        return { ...e, distance: d };
      })
      .filter(e =>
        (e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q)) &&
        (!useRadius || e.distance <= radius) &&
        (!city || e.city.toLowerCase().includes(city.toLowerCase()))
      );

    return {
      clubs: filteredClubs,
      events: filteredEvents,
    };
  }, [query, radius, useRadius, city]);

  return results;
}