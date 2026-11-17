import { Event } from "./event";
import { Picture } from "./picture";

export interface Address {
  street: string;
  city: string;
  zip_code?: string;
  zipCode?: string;
  latitude: string | number | null;
  longitude: string | number | null;
  department_code?: string;
  region?: string;
}

export interface ClubAddressApi {
  street: string;
  city: string;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;
}

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  tiktok?: string;
}

export interface ClubSport {
  id: number;
  codeAps: string;
  famille: string;
  activite: string;
}

export interface ClubApi {
  id: string;
  name: string;
  sport: ClubSport | null;
  clubManagerId: string | null;
  profile: {
    description: string;
    slogan: string;
    phone: string;
    socialLinks: Required<SocialLinks>;
    address: ClubAddressApi;
    bannerPath: string | null;
    profileImagePath: string | null;
  };
  createdAt: string;
  distanceInKm?: number | null;
  isLiked?: boolean;
  isSaved?: boolean;
  isRegistered?: boolean;
  isParticipating?: boolean;
}

export interface Category {
  id: string;
  name: string;
  minAge?: number | null;
  maxAge?: number | null;
  color?: string | null;
  gender?: "male" | "female" | "mixed" | null
}

export interface Status {
  isLiked: boolean;
  isSaved: boolean;
  isParticipating?: boolean;
  isRegistered?: boolean;
  hasActiveLicense?: boolean;
}

export interface Session {
  id: string;
  name: string;
  clubId: string;
  description?: string | null;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  categoryId?: string | null;
  category?: Category | null;
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
    profileImagePath: string | null;
    bannerPath: string | null;
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
  data: ClubApi[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    links: {
      first: string | null;
      "last": string | null;
      "next": string | null;
      "prev": string | null
    }
  };
}

export interface MemberClubsResponse {
  data: ClubApi[];
}

export interface ClubDetailDTO extends ClubApi {
  title?: string;
  type?: string;
  city?: string;
  addressLine1?: string;
  events?: Event[];
  gallery?: Picture[];
  categories?: Category[];
  sessions?: Session[];
  status?: Status;
}