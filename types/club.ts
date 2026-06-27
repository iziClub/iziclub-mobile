import { Event } from "./event";
import { Picture } from "./picture";

export interface Address {
  street: string;
  city: string;
  zip_code: string;
  latitude: string;
  longitude: string;
  department_code: string;
  region: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  title: string;
  type: string;
  city: string;
  addressLine1: string;
  slogan: string;
  profile_image_url: string;
  banner_url: string;
  gallery: Picture[];
  address: Address;
  sport: string | null;
  events: Event[];
  distance_km?: number;
}

export interface ClubsResponse {
  data: Club[];
  meta: {
    total: number;
    currentPage: number;
    lastPage: number;
  };
}

export interface ClubDetailDTO {
    id: string;
    name: string;
    title: string;
    description: string;
    type: string;
    city: string;
    slogan: string;
    addressLine1: string;
    profile_image_url: string;
    banner_url: string;
    events: Event[]; // Remplace any par ton type Event si tu l'as
    sport: string | null;
    address: {
        street: string;
        city: string;
        latitude: string;
        longitude: string;
        zip_code: string;
        department_code: string;
        region: string;
    };
    // profile_image_url: string | null;
    // banner_url: string | null;
    gallery: Picture[]; // Si tu as une galerie d'images pour le club
    distance_km?: number; // Si tu as cette info, sinon tu peux l'ignorer
}