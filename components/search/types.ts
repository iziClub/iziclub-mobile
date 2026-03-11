export interface SearchItem {
  id: string
  name: string
  bannerImageUrl?: string
  imageUrl?: string
  addressLine1: string
  city: string
  latitude: number
  longitude: number
  type: string
  distance?: number
}

export interface eventDetails {
  id: string;
  name: string;
  description: string;
  date: string;      // format "YYYY-MM-DD"
  startTime: string; // format "HH:mm"
  endTime: string;   // format "HH:mm"
  location: string;
  price: string;
  tags?: string[];   // optionnel
};