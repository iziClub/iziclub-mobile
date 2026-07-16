import { Event } from "./event";
import { Picture } from "./picture";

export interface Address {
  street: string;
  city: string;
  zip_code?: string;
  zipCode?: string;
  latitude: string | number;
  longitude: string | number;
  department_code?: string;
  region?: string;
}

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  tiktok?: string;
}

export interface Category {
  id: string;
  name: string;
  minAge: number | null;
  maxAge: number | null;
  color: string | null;
  gender: "male" | "female" | "mixed" | null
}

export interface Status {
  isLiked: boolean;
  isSaved: boolean;
  isParticipating: boolean;
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
    phone?: string;
    email?: string;
    socialLinks?: SocialLinks;
  };
  sport: string | null;
  events: Event[];
  distanceInKm?: number;
  categories?: Category[];
  sessions?: Session[];
  status?: Status;
}

export interface ClubsResponse {
  data: Club[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    links: {
      first: string;
      "last": string;
      "next": string;
      "prev": string | null
    }
  };
  meta: {
    total: number;
    currentPage: number;
    lastPage: number;
  };
}

export interface MemberClubsResponse {
  data: Club[];
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
      phone?: string;
      email?: string;
      socialLinks?: SocialLinks;
    };
    events: Event[]; // Remplace any par ton type Event si tu l'as
    sport: string | null;
    // profile_image_url: string | null;
    // banner_url: string | null;
    gallery: Picture[]; // Si tu as une galerie d'images pour le club
    distanceInKm?: number; // Si tu as cette info, sinon tu peux l'ignorer
    categories?: Category[]; // Si tu as des catégories pour le club
    sessions?: Session[]; // Si tu as des sessions pour le club
    status?: Status; // Si tu as un statut pour le club
}