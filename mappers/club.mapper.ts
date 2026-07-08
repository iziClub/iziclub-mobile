import { Club, ClubDetailDTO } from "../types/club";
import { ClubSearchItem } from "@/components/search/types";

export const mapClubToSearchItem = (club: Club): ClubSearchItem => {
  // console.log("Mapping club to search item:", club); // Log the club object being mapped
  return {
    id: club.id,
    name: club.name,
    city: club.profile.address.city,
    type: "club",
    latitude: club.profile.address.latitude,
    longitude: club.profile.address.longitude,
    image: club.profile.profileImagePath,
    banner : club.profile.bannerPath,
    street: club.profile.address.street,
    sport: club.sport || "Sport non précisé", // Ajout du sport si disponible, sinon une valeur par défaut
    distance_km: club.distanceInKm, // Si tu as cette info, mappe-la ici
  };
};

export const mapApiClubToDetail = (apiClub: ClubDetailDTO) : Club => {
  // console.info("Mapping API club to detail:", apiClub); // Log the API club object being mapped
  return {
    id: apiClub.id,
    name: apiClub.name || "Club sans nom",
    title: apiClub.title || "Bienvenue au club", // Si tu as un titre court
    type: apiClub.sport || "Multisport",
    city: apiClub.profile.address?.city || "Ville non renseignée",
    addressLine1: apiClub.profile.address?.street || "Adresse non renseignée",
    events: apiClub.events || [], // Tu peux remplir cette section avec les événements liés au club si tu as une API pour ça
    gallery: apiClub.gallery || [], // Si tu as une galerie d'images, mappe-la ici
    profile :{
      slogan: apiClub.profile.slogan,
      description: apiClub.profile.description || "Aucune description disponible.",
      address: {
        street: apiClub.profile.address?.street || "Adresse non renseignée",
        city: apiClub.profile.address?.city || "Ville non renseignée",
        latitude: apiClub.profile.address?.latitude || "0",
        longitude: apiClub.profile.address?.longitude || "0",
        zip_code: apiClub.profile.address.zip_code, // Si tu as cette info, mappe-la ici
        department_code: apiClub.profile.address.department_code, // Si tu as cette info, mappe-la ici
        region: apiClub.profile.address.region, // Si tu as cette info, mappe-la ici
      },
      profileImagePath: apiClub.profile.profileImagePath,
      bannerPath: apiClub.profile.bannerPath,  
    },
    sport: apiClub.sport || null, // Ajout du sport si disponible, sinon null
    distanceInKm: apiClub.distanceInKm, // Si tu as cette info, mappe-la ici
    categories: apiClub.categories || [], // Ajout des catégories si disponibles, sinon un tableau vide
    sessions: apiClub.sessions || [], // Ajout des sessions si disponibles, sinon un tableau vide
  };
};