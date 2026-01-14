export interface Club {
  id: number;
  name: string;
  type: string;
  city: string;
  addressLine1: string;
  imageUrl: string;
  bannerImageUrl: string;
  description: string;
  openingHours: string;
  price: number;
  distance?: string;
}
