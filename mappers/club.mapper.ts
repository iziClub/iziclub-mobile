import { Club } from "../types/club";
import { SearchItem } from "@/components/search/types";

export const mapClubToSearchItem = (club: Club): SearchItem => {
  return {
    id: club.id,
    name: club.name,
    bannerImageUrl: club.banner_url ?? "",
    imageUrl: club.profile_image_url ?? "",
    addressLine1: club.address.street,
    city: club.address.city,
    distance: undefined, // backend peut le renvoyer plus tard
    type: "club",
    latitude: club.address.latitude,
    longitude: club.address.longitude,
  };
};