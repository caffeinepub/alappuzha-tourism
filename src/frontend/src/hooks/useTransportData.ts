import { useState } from "react";

export interface TransportItem {
  name: string;
  type: string;
  category: "Boat" | "Road" | "Cycle";
  priceRange: string;
  description: string;
  capacity: string;
}

const STORAGE_KEY = "alappuzha_transport";

const DEFAULTS: TransportItem[] = [
  {
    name: "Luxury Houseboat Hire",
    type: "Houseboat",
    category: "Boat",
    priceRange: "₹8,000 – ₹18,000 / day",
    description:
      "Cruise the backwaters aboard a traditional kettuvallam houseboat with private chef, AC bedrooms, and panoramic deck.",
    capacity: "2–8 passengers",
  },
  {
    name: "Shikara Ride",
    type: "Shikara Boat",
    category: "Boat",
    priceRange: "₹500 – ₹2,000 / hr",
    description:
      "Glide silently through narrow canals on a wooden shikara, perfect for birdwatching, sunrise tours, and photography.",
    capacity: "2–6 passengers",
  },
  {
    name: "Government Ferry",
    type: "Ferry",
    category: "Boat",
    priceRange: "₹10 – ₹50 / trip",
    description:
      "The most affordable way to travel between islands and town — public ferries run by Kerala Water Authority on regular schedules.",
    capacity: "Up to 50 passengers",
  },
  {
    name: "Motorboat Rental",
    type: "Motorboat",
    category: "Boat",
    priceRange: "₹1,500 – ₹4,000 / hr",
    description:
      "Speed across Vembanad Lake in a private motorboat — ideal for island hopping and reaching remote backwater spots.",
    capacity: "4–10 passengers",
  },
  {
    name: "Auto Rickshaw",
    type: "Auto-rickshaw",
    category: "Road",
    priceRange: "₹30 / km (metered)",
    description:
      "The quintessential way to zip around Alappuzha town — three-wheelers are everywhere and ideal for short hops.",
    capacity: "1–3 passengers",
  },
  {
    name: "Taxi / Cab Hire",
    type: "Taxi",
    category: "Road",
    priceRange: "₹12 – ₹15 / km",
    description:
      "Comfortable AC cabs available for full-day or half-day hire — great for visiting Kottayam, Kumarakom, and Kochi.",
    capacity: "4–7 passengers",
  },
  {
    name: "Bicycle Rental",
    type: "Bicycle",
    category: "Cycle",
    priceRange: "₹100 – ₹200 / day",
    description:
      "Explore Alappuzha at your own pace on a rented bicycle — the flat terrain and canal paths make cycling a delight here.",
    capacity: "1 person per bike",
  },
  {
    name: "E-Bicycle Rental",
    type: "E-Bicycle",
    category: "Cycle",
    priceRange: "₹300 – ₹500 / day",
    description:
      "Electric-assist bicycles for effortless exploration — cover more ground without breaking a sweat in the tropical heat.",
    capacity: "1 person per bike",
  },
];

export function useTransportData() {
  const [items, setItems] = useState<TransportItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  const save = (next: TransportItem[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return {
    items,
    add: (t: TransportItem) => save([...items, t]),
    update: (t: TransportItem) =>
      save(items.map((x) => (x.name === t.name ? t : x))),
    remove: (name: string) => save(items.filter((x) => x.name !== name)),
  };
}
