import { Club } from "../types/club";
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
    street: club.address.street,
    sport: club.sport || "Sport non précisé", // Ajout du sport si disponible, sinon une valeur par défaut
  };
};

export const mapApiClubToDetail = (apiClub: Club) => {
  return {
    id: apiClub.id,
    name: apiClub.name || "Club sans nom",
    title: apiClub.description || "Bienvenue au club", // Si tu as un titre court
    description: apiClub.description || "Aucune description disponible.",
    type: apiClub.sport || "Multisport",
    city: apiClub.address?.city || "Ville non renseignée",
    addressLine1: apiClub.address?.street || "Adresse non renseignée",
    imageUrl: apiClub.profile_image_url || "https://picsum.photos/200",
    bannerImageUrl: apiClub.banner_url || "https://picsum.photos/600/400",
    // Ajoute ici d'autres champs dont tes sections pourraient avoir besoin
    // phone: apiClub.phone,
    // email: apiClub.email,
    // socials: apiClub.social_links || {},
  };
};