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

export interface Category {
  id: string;
  name: string;
  minAge: number | null;
  maxAge: number | null;
  color: string | null;
  gender: "male" | "female" | "mixed" | null
}

export interface Session {
  id: string;
  name: string;
  clubId: string;
  description: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  categoryId: string;
  category: Category;
  createdAt: string;
}

export interface Club {
  id: string;
  name: string;
  title: string;
  type: string;
  city: string;
  addressLine1: string;
  gallery: Picture[];
  profile: {
    slogan: string;
    address: Address;
    profileImagePath: string;
    bannerPath: string;
    description: string;
  };
  sport: string | null;
  events: Event[];
  distanceInKm?: number;
  categories?: Category[];
  sessions?: Session[];
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
    type: string;
    city: string;
    addressLine1: string;
    profile: {
      slogan: string;
      description: string;
      address: Address;
      profileImagePath: string;
      bannerPath: string;
    };
    events: Event[]; // Remplace any par ton type Event si tu l'as
    sport: string | null;
    // profile_image_url: string | null;
    // banner_url: string | null;
    gallery: Picture[]; // Si tu as une galerie d'images pour le club
    distanceInKm?: number; // Si tu as cette info, sinon tu peux l'ignorer
    categories?: Category[]; // Si tu as des catégories pour le club
    sessions?: Session[]; // Si tu as des sessions pour le club
}