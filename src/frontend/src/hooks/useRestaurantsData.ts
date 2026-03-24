import { useState } from "react";

export interface Restaurant {
  name: string;
  cuisine: "Seafood" | "Kerala" | "Vegetarian" | "Multi-cuisine" | "Café";
  priceRange: "Budget" | "Mid-range" | "Premium";
  rating: number;
  description: string;
  specialty: string;
  imageUrl?: string;
}

const STORAGE_KEY = "alappuzha_restaurants";

const CUISINE_IMAGES: Record<string, string> = {
  Seafood: "/assets/generated/restaurant-seafood.dim_600x400.jpg",
  Kerala: "/assets/generated/restaurant-kerala.dim_600x400.jpg",
  Vegetarian: "/assets/generated/restaurant-veg.dim_600x400.jpg",
  "Multi-cuisine": "/assets/generated/restaurant-multi.dim_600x400.jpg",
  Café: "/assets/generated/restaurant-cafe.dim_600x400.jpg",
};

export function getRestaurantImage(restaurant: Restaurant): string {
  if (restaurant.imageUrl?.startsWith("/assets")) return restaurant.imageUrl;
  return (
    CUISINE_IMAGES[restaurant.cuisine] ??
    "/assets/generated/restaurant-kerala.dim_600x400.jpg"
  );
}

const DEFAULTS: Restaurant[] = [
  {
    name: "Mushroom Restaurant",
    cuisine: "Kerala",
    priceRange: "Budget",
    rating: 4,
    description:
      "A beloved local joint serving authentic Kerala thali with freshly ground spices and coconut-based curries that locals swear by.",
    specialty: "Kerala Sadya & Fish Curry",
  },
  {
    name: "Thaff Restaurant",
    cuisine: "Seafood",
    priceRange: "Mid-range",
    rating: 4,
    description:
      "Fresh catch from the backwaters grilled, fried, or curried to perfection. Their karimeen pollichathu (pearl spot fish) is unmissable.",
    specialty: "Karimeen Pollichathu",
  },
  {
    name: "Harbour Restaurant",
    cuisine: "Multi-cuisine",
    priceRange: "Mid-range",
    rating: 4,
    description:
      "A versatile restaurant at the harbour with stunning water views, serving everything from continental breakfasts to Kerala dinner spreads.",
    specialty: "Waterfront Dining",
  },
  {
    name: "Chakara Restaurant",
    cuisine: "Seafood",
    priceRange: "Premium",
    rating: 5,
    description:
      "Named after the miraculous phenomenon of fish surfacing in the backwaters, Chakara is Alappuzha's finest seafood destination.",
    specialty: "Lobster & Prawn Platter",
  },
  {
    name: "Dreamers Café",
    cuisine: "Café",
    priceRange: "Budget",
    rating: 4,
    description:
      "A charming canal-side café beloved by travellers for its freshly brewed filter coffee, banana pancakes, and breezy lakeside vibe.",
    specialty: "Filter Coffee & Pancakes",
  },
  {
    name: "Komala Restaurant",
    cuisine: "Vegetarian",
    priceRange: "Budget",
    rating: 4,
    description:
      "A pure vegetarian gem serving South Indian classics — idli, dosa, sambar — cooked the traditional way with no shortcuts.",
    specialty: "Masala Dosa & Sambar",
  },
  {
    name: "Ramees Restaurant",
    cuisine: "Kerala",
    priceRange: "Budget",
    rating: 4,
    description:
      "Authentic Malabar cuisine with fragrant biryanis, mutton stew, and the best appam-stew combo in Alappuzha.",
    specialty: "Malabar Biryani",
  },
  {
    name: "Royale Park Hotel Restaurant",
    cuisine: "Multi-cuisine",
    priceRange: "Mid-range",
    rating: 4,
    description:
      "An elegant hotel restaurant offering a broad menu from Mughlai to Italian, with a dedicated Sunday brunch buffet.",
    specialty: "Sunday Brunch Buffet",
  },
  {
    name: "Lake Paradise Restaurant",
    cuisine: "Seafood",
    priceRange: "Premium",
    rating: 5,
    description:
      "Perched on the edge of Vembanad Lake, this premium dining spot pairs panoramic sunset views with expertly prepared backwater fish dishes.",
    specialty: "Backwater Fish Platter",
  },
  {
    name: "Arookutty Fish Stall",
    cuisine: "Seafood",
    priceRange: "Budget",
    rating: 4,
    description:
      "A no-frills roadside stall near the fishing hamlet of Arookutty — the most honest seafood in town, straight off the boat.",
    specialty: "Fried Fish & Clams",
  },
];

export function useRestaurantsData() {
  const [items, setItems] = useState<Restaurant[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  const save = (next: Restaurant[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return {
    items,
    add: (r: Restaurant) => save([...items, r]),
    update: (r: Restaurant) =>
      save(items.map((x) => (x.name === r.name ? r : x))),
    remove: (name: string) => save(items.filter((x) => x.name !== name)),
  };
}
