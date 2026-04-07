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
  slogan: string;
  profile_image_url: string | null;
  banner_url: string | null;
  gallery: string[];
  address: Address;
}

export interface ClubsResponse {
  data: Club[];
  meta: {
    total: number;
    currentPage: number;
    lastPage: number;
  };
}