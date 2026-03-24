import { useState } from "react";

export interface StayItem {
  name: string;
  category: "Houseboat" | "Resort" | "Homestay" | "Hotel";
  stars: number;
  price: string;
  description: string;
  amenities: string[];
  imageUrl: string;
}

const STORAGE_KEY = "alappuzha_stays";

const DEFAULTS: StayItem[] = [
  {
    name: "Punnamada Lake Houseboat",
    category: "Houseboat",
    stars: 5,
    price: "₹8,000 – ₹18,000 / night",
    description:
      "A premium luxury houseboat cruising Punnamada Lake with AC bedrooms, sundeck, and chef-cooked Kerala meals.",
    amenities: ["AC Bedrooms", "Private Chef", "Sundeck", "Wi-Fi"],
    imageUrl: "/assets/generated/stay-houseboat-luxury.dim_600x400.jpg",
  },
  {
    name: "Alleppey Floating Dreams",
    category: "Houseboat",
    stars: 4,
    price: "₹5,000 – ₹12,000 / night",
    description:
      "Traditional Kerala kettuvallam converted into a cozy 2-bedroom floating home with panoramic backwater views.",
    amenities: ["2 Bedrooms", "Kitchen", "Deck", "Fishing"],
    imageUrl: "/assets/generated/place-houseboat.dim_600x400.jpg",
  },
  {
    name: "Budget Backwater Cruise",
    category: "Houseboat",
    stars: 3,
    price: "₹2,500 – ₹4,500 / night",
    description:
      "An affordable houseboat experience with basic amenities, ideal for budget travelers wanting to experience the backwaters.",
    amenities: ["Fan Rooms", "Meals Included", "Shared Deck"],
    imageUrl: "/assets/generated/place-punnamada.dim_600x400.jpg",
  },
  {
    name: "Marari Beach Resort",
    category: "Resort",
    stars: 5,
    price: "₹7,000 – ₹15,000 / night",
    description:
      "An award-winning eco-resort on Marari beach with private beach access, Ayurvedic spa, and organic garden.",
    amenities: ["Private Beach", "Spa", "Pool", "Ayurveda"],
    imageUrl: "/assets/generated/stay-marari-resort.dim_600x400.jpg",
  },
  {
    name: "Alappuzha Beach Hotel",
    category: "Hotel",
    stars: 4,
    price: "₹3,500 – ₹7,000 / night",
    description:
      "A modern seafront hotel steps from Alappuzha Beach with sea-view rooms, rooftop dining, and tour desk.",
    amenities: ["Sea View", "Rooftop Dining", "Tour Desk", "Wi-Fi"],
    imageUrl: "/assets/generated/stay-beach-hotel.dim_600x400.jpg",
  },
  {
    name: "Vembanad Lakeshore Resort",
    category: "Resort",
    stars: 4,
    price: "₹5,500 – ₹10,000 / night",
    description:
      "A serene lakeside resort with water-facing cottages, sunrise kayaking, and authentic Kerala cuisine.",
    amenities: ["Lake View", "Kayaking", "Pool", "Restaurant"],
    imageUrl: "/assets/generated/stay-lakeshore-resort.dim_600x400.jpg",
  },
  {
    name: "Green Palms Homestay",
    category: "Homestay",
    stars: 4,
    price: "₹1,800 – ₹3,500 / night",
    description:
      "A family-run homestay surrounded by coconut groves, offering home-cooked Keralan meals and bicycle tours.",
    amenities: ["Home Meals", "Bicycles", "Garden", "Wi-Fi"],
    imageUrl: "/assets/generated/stay-homestay.dim_600x400.jpg",
  },
  {
    name: "Backwater Village Homestay",
    category: "Homestay",
    stars: 3,
    price: "₹1,200 – ₹2,200 / night",
    description:
      "An authentic village homestay by the canal, with fishing, cooking classes, and cultural immersion.",
    amenities: ["Canal View", "Cooking Class", "Fishing"],
    imageUrl: "/assets/generated/place-island.dim_600x400.jpg",
  },
  {
    name: "Heritage Bungalow Inn",
    category: "Hotel",
    stars: 3,
    price: "₹2,000 – ₹4,000 / night",
    description:
      "A restored colonial bungalow in the heart of Alappuzha town, offering characterful rooms and a garden café.",
    amenities: ["Garden Café", "Heritage Rooms", "Wi-Fi"],
    imageUrl: "/assets/generated/stay-heritage-bungalow.dim_600x400.jpg",
  },
  {
    name: "Kuttanad Eco Retreat",
    category: "Resort",
    stars: 4,
    price: "₹4,500 – ₹9,000 / night",
    description:
      "A sustainable eco-retreat in the paddy fields of Kuttanad with treehouse rooms, bullock cart rides, and birdwatching.",
    amenities: ["Treehouse Rooms", "Birdwatching", "Eco Pool", "Organic Food"],
    imageUrl: "/assets/generated/stay-eco-retreat.dim_600x400.jpg",
  },
];

export function useStaysData() {
  const [items, setItems] = useState<StayItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // Reset to defaults to pick up new images
        const parsed: StayItem[] = JSON.parse(stored);
        // If stored data uses old place- images for stays, reset to defaults
        const usesOldImages = parsed.some(
          (s) =>
            s.imageUrl === "/assets/generated/place-paddy.dim_600x400.jpg" ||
            s.imageUrl === "/assets/generated/place-palace.dim_600x400.jpg" ||
            (s.category === "Houseboat" &&
              s.name === "Punnamada Lake Houseboat" &&
              s.imageUrl !==
                "/assets/generated/stay-houseboat-luxury.dim_600x400.jpg"),
        );
        if (usesOldImages) return DEFAULTS;
        return parsed;
      }
      return DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  const save = (next: StayItem[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return {
    items,
    add: (s: StayItem) => save([...items, s]),
    update: (s: StayItem) =>
      save(items.map((x) => (x.name === s.name ? s : x))),
    remove: (name: string) => save(items.filter((x) => x.name !== name)),
  };
}
