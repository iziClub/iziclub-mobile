export interface SearchItem {
  id: string
  name: string
  bannerImageUrl?: string
  imageUrl?: string
  addressLine1: string
  city: string
  latitude: string
  longitude: string
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