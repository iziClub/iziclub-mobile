import { Club, ClubDetailDTO } from "../types/club";
import { ClubSearchItem } from "@/components/search/types";

export const mapClubToSearchItem = (club: Club): ClubSearchItem => {
  return {
    id: club.id,
    name: club.name,
    city: club.address.city,
    type: "club",
    latitude: club.address.latitude,
    longitude: club.address.longitude,
    image: club.profile_image_url,
    banner : club.banner_url,
    street: club.address.street,
    sport: club.sport || "Sport non précisé", // Ajout du sport si disponible, sinon une valeur par défaut
    distance_km: club.distance_km, // Si tu as cette info, mappe-la ici
  };
};

export const mapApiClubToDetail = (apiClub: ClubDetailDTO) : Club => {
  return {
    id: apiClub.id,
    name: apiClub.name || "Club sans nom",
    title: apiClub.description || "Bienvenue au club", // Si tu as un titre court
    description: apiClub.description || "Aucune description disponible.",
    type: apiClub.sport || "Multisport",
    city: apiClub.address?.city || "Ville non renseignée",
    addressLine1: apiClub.address?.street || "Adresse non renseignée",
    profile_image_url: apiClub.profile_image_url,
    banner_url: apiClub.banner_url,
    events: apiClub.events || [], // Tu peux remplir cette section avec les événements liés au club si tu as une API pour ça
    slogan: apiClub.slogan,
    gallery: apiClub.gallery || [], // Si tu as une galerie d'images, mappe-la ici
    address: {
      street: apiClub.address?.street || "Adresse non renseignée",
      city: apiClub.address?.city || "Ville non renseignée",
      latitude: apiClub.address?.latitude || "0",
      longitude: apiClub.address?.longitude || "0",
      zip_code: apiClub.address.zip_code, // Si tu as cette info, mappe-la ici
      department_code: apiClub.address.department_code, // Si tu as cette info, mappe-la ici
      region: apiClub.address.region, // Si tu as cette info, mappe-la ici
    },
    sport: apiClub.sport || null, // Ajout du sport si disponible, sinon null
    distance_km: apiClub.distance_km, // Si tu as cette info, mappe-la ici
    // Ajoute ici d'autres champs dont tes sections pourraient avoir besoin
    // phone: apiClub.phone,
    // email: apiClub.email,
    // socials: apiClub.social_links || {},
  };
};