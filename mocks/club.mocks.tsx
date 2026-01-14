import { Club } from "../types/club";

export const MOCK_CLUBS: Club[] = Array.from({ length: 60 }).map((_, i) => ({
  id: i + 1,
  name: `Club ${i + 1}`,
  type: ["Fitness", "Football", "Tennis", "Yoga", "Crossfit"][i % 5],
  city: ["Paris", "Lyon", "Marseille", "Lille", "Bordeaux"][i % 5],
  addressLine1: `${10 + i} rue du Sport`,
  imageUrl: `https://picsum.photos/seed/avatar${i}/300/300`,
  bannerImageUrl: `https://picsum.photos/seed/banner${i}/800/500`,
  description:
    "Un club moderne et convivial proposant des installations de qualité, des coachs certifiés et une ambiance chaleureuse.",
  openingHours: "Lun–Ven 7h–22h · Sam–Dim 9h–20h",
  price: 29 + (i % 5) * 10,
  distance: (Math.random() * 15 + 0.5).toFixed(1),
}));
