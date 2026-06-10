// import { useState, useMemo, useEffect } from "react";
// import { clubs, events, USER_LOCATION } from "./data";

// // function distanceKm(lat1:number, lon1:number, lat2:number, lon2:number) {
// //   const R = 6371;
// //   const dLat = (lat2-lat1) * Math.PI/180;
// //   const dLon = (lon2-lon1) * Math.PI/180;

// //   const a =
// //     Math.sin(dLat/2) * Math.sin(dLat/2) +
// //     Math.cos(lat1*Math.PI/180) *
// //     Math.cos(lat2*Math.PI/180) *
// //     Math.sin(dLon/2) *
// //     Math.sin(dLon/2);

// //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

// //   return R*c;
// // }

// // export function useSearch(
// //   query: string,
// //   radius: number,
// //   useRadius: boolean,
// //   city: string
// // ) {
// //   const results = useMemo(() => {
// //     const q = query.toLowerCase();

// //     const filteredClubs = clubs
// //       .map(c => {
// //         const d = distanceKm(
// //           USER_LOCATION.latitude,
// //           USER_LOCATION.longitude,
// //           c.latitude,
// //           c.longitude
// //         );
// //         return { ...c, distance: d };
// //       })
// //       .filter(c =>
// //         // Recherche sur le nom OU le type
// //         (c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)) &&
// //         (!useRadius || c.distance <= radius) &&
// //         (!city || c.city.toLowerCase().includes(city.toLowerCase()))
// //       );

// //     const filteredEvents = events
// //       .map(e => {
// //         const d = distanceKm(
// //           USER_LOCATION.latitude,
// //           USER_LOCATION.longitude,
// //           e.latitude,
// //           e.longitude
// //         );
// //         return { ...e, distance: d };
// //       })
// //       .filter(e =>
// //         (e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q)) &&
// //         (!useRadius || e.distance <= radius) &&
// //         (!city || e.city.toLowerCase().includes(city.toLowerCase()))
// //       );

// //     return {
// //       clubs: filteredClubs,
// //       events: filteredEvents,
// //     };
// //   }, [query, radius, useRadius, city]);

// //   return results;
// // }

// // import api from "@/services/api";

// // export const useSearch = (
// //   query: string,
// //   radius: number,
// //   useRadius: boolean,
// //   city: string
// // ) => {
// //   const [clubs, setClubs] = useState([]);
// //   const [events, setEvents] = useState([]);
// //   const [loading, setLoading] = useState(false);

// //   useEffect(() => {
// //     const fetchResults = async () => {
// //       setLoading(true);
// //       try {
// //         // Préparation des paramètres de base
// //         const params = {
// //           search: query,
// //           limit: '20', // Tu peux l'ajuster ou le rendre dynamique
// //           page: '1',
// //         };

// //         // Si le rayon est activé, on ajoute le radius
// //         // Note: L'API semble attendre latitude/longitude pour que radius fonctionne
// //         if (useRadius) {
// //           params.radius = radius.toString();
// //           // params.latitude = ... (à récupérer via Expo Location si besoin)
// //           // params.longitude = ...
// //         }

// //         // Exécution des appels
// //         const [clubsRes, eventsRes] = await Promise.all([
// //           api.get('/clubs', { params }),
// //           api.get('/events', { params })
// //         ]);

// //         // On met à jour les états (en supposant que ton intercepteur renvoie .data)
// //         setClubs(clubsRes || []);
// //         setEvents(eventsRes || []);

// //       } catch (error) {
// //         console.error("Erreur API Search:", error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     // On lance la recherche si on a au moins 2 caractères ou si on change le rayon
// //     if (query.length > 1 || city.length > 1 || useRadius) {
// //       fetchResults();
// //     }
// //   }, [query, radius, useRadius, city]);

// //   return { clubs, events, loading };
// // };

// // src/components/search/useSearch.ts

// import { useEffect, useState } from "react";
// import { getClubs } from "@/api/clubs.api";
// import { mapClubToSearchItem } from "@/mappers/club.mapper";
// import { SearchItem } from "./types";

// export const useSearch = (
//   query: string,
//   radius: number,
//   useRadius: boolean,
//   city: string
// ) => {
//   const [clubs, setClubs] = useState<SearchItem[]>([]);
//   const [events, setEvents] = useState<SearchItem[]>([]);

//   const fetchData = async () => {
//     try {
//       const res = await getClubs();

//       let mappedClubs = res.data.map(mapClubToSearchItem);

//       // 🔍 FILTRE NOM
//       if (query) {
//         mappedClubs = mappedClubs.filter((club) =>
//           club.name.toLowerCase().includes(query.toLowerCase())
//         );
//       }

//       // 🏙️ FILTRE VILLE
//       if (city) {
//         mappedClubs = mappedClubs.filter((club) =>
//           club.city.toLowerCase().includes(city.toLowerCase())
//         );
//       }

//       // 📍 FILTRE RAYON (optionnel pour plus tard)
//       if (useRadius) {
//         // TODO: calcul distance
//       }

//       setClubs(mappedClubs);

//       // 👉 pour l’instant vide ou mock
//       setEvents([]);

//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [query, radius, useRadius, city]);

//   return { clubs, events };
// };

// src/components/search/useSearch.ts

import { useEffect, useState } from "react";
import { getClubs } from "@/services/clubs.service";
import { mapClubToSearchItem } from "@/mappers/club.mapper";
import { ClubSearchItem, EventSearchItem, SearchItem } from "./types";
import { getEvents } from "@/services/events.service";
import { mapEventToSearchItem } from "@/mappers/event.mapper";

export const useSearch = (
  query: string,
  radius: number,
  useRadius: boolean,
  city: string,
  // 1. Ajout d'un paramètre optionnel pour les coordonnées de la carte
  mapCoords?: { latitude: number; longitude: number } 
) => {
  const [clubs, setClubs] = useState<ClubSearchItem[]>([]);
  const [events, setEvents] = useState<EventSearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 📍 Position par défaut (Nancy) si mapCoords n'est pas fourni
      const defaultLat = 48.692;
      const defaultLon = 6.184;
        
      const params: any = {
  search: query || undefined,
  city: city || undefined,
  limit: 20,
  page: 1,
};

// ✅ seulement si activé
if (useRadius) {
  params.latitude = mapCoords?.latitude ?? defaultLat;
  params.longitude = mapCoords?.longitude ?? defaultLon;
  params.radius = radius;
}
      // const res = await getClubs({
      //   search: query || undefined,
      //   city: city || undefined,
      //   // 2. On utilise mapCoords en priorité, sinon la position par défaut si useRadius est vrai
      //   latitude: mapCoords ? mapCoords.latitude : (useRadius ? defaultLat : undefined),
      //   longitude: mapCoords ? mapCoords.longitude : (useRadius ? defaultLon : undefined),
      //   radius: useRadius || mapCoords ? radius : undefined,
      //   limit: 20,
      //   page: 1,
      // });
      const [clubsRes, eventsRes] = await Promise.all([
        getClubs(params),
        getEvents(params) // Ajoute cette fonction dans ton services/events.service
      ]);

      const mappedClubs = clubsRes.data.map(mapClubToSearchItem);
      const mappedEvents = eventsRes.data.map(mapEventToSearchItem);
      // console.log("mapped events :", mappedEvents);
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
    // 3. On ajoute les coordonnées de la carte dans les dépendances
    // On surveille les valeurs primitives (lat/lon) pour éviter les boucles infinies
  }, [query, radius, useRadius, city, mapCoords?.latitude, mapCoords?.longitude]);

  return { clubs, events, loading, refresh: fetchData };
};