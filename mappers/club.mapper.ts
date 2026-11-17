import { Club, ClubApi, ClubDetailDTO } from "../types/club";
import { ClubSearchItem } from "@/components/search/types";

export const mapClubToSearchItem = (club: ClubApi): ClubSearchItem => {
  return {
    id: club.id,
    name: club.name,
    city: club.profile.address.city,
    type: "club",
    latitude: String(club.profile.address.latitude ?? "0"),
    longitude: String(club.profile.address.longitude ?? "0"),
    image: club.profile.profileImagePath,
    banner : club.profile.bannerPath,
    street: club.profile.address.street,
    sport: club.sport?.famille ?? club.sport?.activite ?? "Sport non précisé",
    distanceInKm: club.distanceInKm ?? undefined,
  };
};

export const mapApiClubToDetail = (apiClub: ClubDetailDTO) : Club => {
  // console.info("Mapping API club to detail:", apiClub); // Log the API club object being mapped
  return {
    id: apiClub.id,
    name: apiClub.name || "Club sans nom",
    title: apiClub.title || "Bienvenue au club", // Si tu as un titre court
    type: apiClub.sport?.famille || "Multisport",
    city: apiClub.profile.address.city || "Ville non renseignée",
    addressLine1: apiClub.profile.address.street || "Adresse non renseignée",
    events: apiClub.events || [], // Tu peux remplir cette section avec les événements liés au club si tu as une API pour ça
    gallery: apiClub.gallery || [], // Si tu as une galerie d'images, mappe-la ici
    profile :{
      slogan: apiClub.profile.slogan,
      description: apiClub.profile.description || "Aucune description disponible.",
      address: {
        street: apiClub.profile.address?.street || "Adresse non renseignée",
        city: apiClub.profile.address?.city || "Ville non renseignée",
        latitude: apiClub.profile.address.latitude ?? "0",
        longitude: apiClub.profile.address.longitude ?? "0",
        zipCode: apiClub.profile.address.zipCode,
      },
      profileImagePath: apiClub.profile.profileImagePath,
      bannerPath: apiClub.profile.bannerPath,
      phone: apiClub.profile.phone,
      socialLinks: {
        instagram: apiClub.profile.socialLinks?.instagram,
        linkedin: apiClub.profile.socialLinks?.linkedin,
        facebook: apiClub.profile.socialLinks?.facebook,
        tiktok: apiClub.profile.socialLinks?.tiktok,
      },
    },
    sport: apiClub.sport?.famille ?? apiClub.sport?.activite ?? null,
    distanceInKm: apiClub.distanceInKm ?? undefined,
    categories: apiClub.categories || [], // Ajout des catégories si disponibles, sinon un tableau vide
    sessions: apiClub.sessions || [], // Ajout des sessions si disponibles, sinon un tableau vide
    status: apiClub.status || {
      isLiked: apiClub.isLiked ?? false,
      isSaved: apiClub.isSaved ?? false,
      isRegistered: apiClub.isRegistered ?? false,
    },
  };
};