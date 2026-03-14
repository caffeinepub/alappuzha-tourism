import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Calculator,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Page } from "../App";

interface ChatbotWidgetProps {
  navigate: (page: Page) => void;
}

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  suggestions?: string[];
  navAction?: Page;
  estimatorResult?: EstimatorResult;
}

type Topic =
  | "places"
  | "time"
  | "food"
  | "houseboat"
  | "transport"
  | "festivals"
  | "budget"
  | "stay"
  | "itinerary"
  | "restaurants"
  | null;

type EstimatorStep =
  | null
  | "days"
  | "accommodation"
  | "transport"
  | "food"
  | "activities"
  | "result";

interface EstimatorState {
  active: boolean;
  step: EstimatorStep;
  days?: number;
  accommodation?: string;
  transport?: string;
  food?: string;
  activities?: string;
}

interface EstimatorResult {
  days: number;
  accommodation: string;
  transport: string;
  food: string;
  activities: string;
  accCost: number;
  transportCost: number;
  foodCost: number;
  actCost: number;
  total: number;
  totalMax: number;
}

const ACC_RATES: Record<string, number> = {
  "Budget homestay": 700,
  "Mid-range hotel": 3000,
  "Luxury resort": 8000,
  Houseboat: 12000,
};
const TRANSPORT_RATES: Record<string, number> = {
  "Public transport": 200,
  "Auto-rickshaw / taxi": 500,
  "Rented vehicle": 800,
};
const FOOD_RATES: Record<string, number> = {
  "Street food / local eateries": 250,
  "Mid-range restaurants": 600,
  "Fine dining": 1200,
};
const ACTIVITY_RATES: Record<string, number> = {
  "Free / budget activities": 100,
  "Mix of paid & free": 500,
  "Houseboat + tours": 1500,
};

const ESTIMATOR_STEPS: Record<
  NonNullable<EstimatorStep>,
  { question: string; chips: string[] }
> = {
  days: {
    question: "🗓️ **How many days** is your trip?",
    chips: ["1", "2", "3", "4", "5", "6", "7"],
  },
  accommodation: {
    question: "🏡 What type of **accommodation** do you prefer?",
    chips: ["Budget homestay", "Mid-range hotel", "Luxury resort", "Houseboat"],
  },
  transport: {
    question: "🚌 What's your **transport preference**?",
    chips: ["Public transport", "Auto-rickshaw / taxi", "Rented vehicle"],
  },
  food: {
    question: "🍛 What's your **food preference**?",
    chips: [
      "Street food / local eateries",
      "Mid-range restaurants",
      "Fine dining",
    ],
  },
  activities: {
    question: "🎯 What kind of **activities** are you planning?",
    chips: [
      "Free / budget activities",
      "Mix of paid & free",
      "Houseboat + tours",
    ],
  },
  result: { question: "", chips: [] },
};

const STEP_ORDER: EstimatorStep[] = [
  "days",
  "accommodation",
  "transport",
  "food",
  "activities",
  "result",
];

function computeEstimate(state: EstimatorState): EstimatorResult {
  const days = state.days ?? 1;
  const accRate = ACC_RATES[state.accommodation ?? "Budget homestay"] ?? 700;
  const transRate =
    TRANSPORT_RATES[state.transport ?? "Public transport"] ?? 200;
  const foodRate =
    FOOD_RATES[state.food ?? "Street food / local eateries"] ?? 250;
  const actRate =
    ACTIVITY_RATES[state.activities ?? "Free / budget activities"] ?? 100;

  const nights = days;
  const accCost = accRate * nights;
  const transportCost = transRate * days;
  const foodCost = foodRate * days;
  const actCost = actRate * days;
  const total = accCost + transportCost + foodCost + actCost;
  const totalMax = Math.round(total * 1.2);

  return {
    days,
    accommodation: state.accommodation ?? "Budget homestay",
    transport: state.transport ?? "Public transport",
    food: state.food ?? "Street food / local eateries",
    activities: state.activities ?? "Free / budget activities",
    accCost,
    transportCost,
    foodCost,
    actCost,
    total,
    totalMax,
  };
}

// --- Nearby places data ---
const NEARBY_DATA: Record<string, { name: string; dist: string }[]> = {
  beach: [
    { name: "Lighthouse Pier", dist: "on-site" },
    { name: "Mullackal Temple", dist: "1 km" },
    { name: "Alappuzha Market", dist: "1.5 km" },
    { name: "Finishing Point", dist: "3 km" },
    { name: "Alappuzha Bus Stand", dist: "2 km" },
  ],
  punnamada: [
    { name: "Alappuzha Finishing Point", dist: "adjacent" },
    { name: "Nehru Trophy Race Start", dist: "on-site" },
    { name: "Kuttanad Backwaters", dist: "5 km" },
    { name: "Vembanad Lake Birdwatching", dist: "2 km" },
    { name: "Alappuzha Beach", dist: "4 km" },
  ],
  arthunkal: [
    { name: "Arthunkal Beach", dist: "0.2 km" },
    { name: "Pallippuram Fort", dist: "12 km" },
    { name: "Cherthala Town", dist: "10 km" },
    { name: "Vembanad Lake View", dist: "1.5 km" },
    { name: "Kalarcode Lake", dist: "8 km" },
  ],
  pathiramanal: [
    { name: "Vembanad Birdwatching Spots", dist: "nearby" },
    { name: "Muhamma Village", dist: "1 km by water" },
    { name: "Punnamada Lake", dist: "3 km by water" },
    { name: "Kottayam Backwaters", dist: "via boat" },
    { name: "Kumarakom Bird Sanctuary", dist: "6 km by water" },
  ],
  marari: [
    { name: "Mararikulam Village", dist: "1 km" },
    { name: "Traditional Fishing Community", dist: "0.5 km" },
    { name: "Marari Ayurveda Center", dist: "2 km" },
    { name: "Andhakaranazhi Beach", dist: "5 km" },
    { name: "Alappuzha Town", dist: "14 km" },
  ],
};

const TOP_PLACES_FROM_TOWN = [
  { name: "Alappuzha Beach", dist: "2 km from town" },
  { name: "Punnamada Lake", dist: "3 km from town" },
  { name: "Coir Museum", dist: "1 km from town" },
  { name: "Mullackal Temple", dist: "0.5 km from town" },
  { name: "Alappuzha Backwaters", dist: "1 km from town" },
];

function detectNearbyQuery(text: string): boolean {
  return /near(by)?|close to|around|within.*km|walking distance|what.?s near|places near|things near/.test(
    text,
  );
}

function detectNearbyLocation(
  text: string,
): keyof typeof NEARBY_DATA | "generic" {
  const t = text.toLowerCase();
  if (/beach/.test(t) && !/marari/.test(t)) return "beach";
  if (/marari/.test(t)) return "marari";
  if (/punnamada|lake/.test(t)) return "punnamada";
  if (/arthunkal|church/.test(t)) return "arthunkal";
  if (/pathiramanal|island/.test(t)) return "pathiramanal";
  return "generic";
}

function getNearbyResponse(text: string): BotResult {
  const loc = detectNearbyLocation(text);
  const labels: Record<keyof typeof NEARBY_DATA | "generic", string> = {
    beach: "Alappuzha Beach",
    marari: "Marari Beach",
    punnamada: "Punnamada Lake",
    arthunkal: "Arthunkal Church",
    pathiramanal: "Pathiramanal Island",
    generic: "Alappuzha Town Centre",
  };

  const places = loc === "generic" ? TOP_PLACES_FROM_TOWN : NEARBY_DATA[loc];
  const label = labels[loc];

  const lines = places.map((p) => `• **${p.name}** — ${p.dist}`).join("\n");

  return {
    text: `📍 **Places near ${label}:**\n\n${lines}\n\n💡 These can all be reached by auto-rickshaw or bicycle!`,
    suggestions: [
      "Places near Alappuzha Beach",
      "Near Punnamada Lake",
      "Near Arthunkal Church",
      "Plan my itinerary",
    ],
  };
}

function detectEstimatorTrigger(text: string): boolean {
  return /estimate.*cost|cost.*estimat|trip.*budget|budget.*trip|how much.*trip|trip.*cost|cost.*calculator|estimat.*trip|start.*estimat/.test(
    text,
  );
}

const INITIAL_QUICK_REPLIES = [
  "Best places to visit",
  "Best time to visit",
  "Food to try",
  "Houseboat tips",
  "Getting there",
  "Nearby attractions",
  "Trip cost estimator",
];

const TOPIC_FOLLOWUPS: Record<NonNullable<Topic>, string[]> = {
  places: [
    "Tell me about the backwaters",
    "Beach activities?",
    "Hidden gems",
    "Plan my itinerary",
  ],
  time: [
    "What about monsoon?",
    "Boat Race details",
    "Onam festival",
    "Best places to visit",
  ],
  food: [
    "Where to eat?",
    "Vegetarian options?",
    "Street food?",
    "Budget for food",
  ],
  houseboat: [
    "How to book?",
    "Cost of houseboats",
    "Overnight experience",
    "What's included?",
  ],
  transport: [
    "Auto-rickshaw tips",
    "Boat rides",
    "Taxi cost",
    "Get to Alappuzha",
  ],
  festivals: [
    "Nehru Trophy details",
    "Onam celebrations",
    "Best time to visit",
    "What to wear",
  ],
  budget: [
    "Open Budget Calculator",
    "Cheap food options",
    "Budget hotels",
    "Save on houseboats",
  ],
  stay: [
    "Book accommodation",
    "Houseboat stay",
    "Budget homestays",
    "Luxury resorts",
  ],
  itinerary: [
    "Plan my trip",
    "3-day itinerary",
    "5-day itinerary",
    "Places near Alappuzha",
  ],
  restaurants: [
    "Book a restaurant",
    "Local cuisine",
    "Seafood spots",
    "Budget meals",
  ],
};

function detectTopic(text: string): Topic {
  const t = text.toLowerCase();
  if (/restaurant|dining|eat|meal|food|seafood|cuisine|lunch|dinner/.test(t))
    return "restaurants";
  if (/stay|hotel|resort|homestay|accommodation|room/.test(t)) return "stay";
  if (/houseboat|boat|cruise|backwater/.test(t)) return "houseboat";
  if (/transport|taxi|auto|bus|train|travel|reach|getting|how.?to.?get/.test(t))
    return "transport";
  if (/itinerary|plan|schedule|trip|days|tour/.test(t)) return "itinerary";
  if (/places|visit|top|must.?see|attraction|destination/.test(t))
    return "places";
  if (/time|when|season|month|weather|monsoon|climate/.test(t)) return "time";
  if (/food|eat|cuisine|fish|meal|snack|drink/.test(t)) return "food";
  if (/festival|event|boat race|nehru|onam|celebration/.test(t))
    return "festivals";
  if (/budget|cost|price|cheap|expensive|money|spend/.test(t)) return "budget";
  return null;
}

interface BotResult {
  text: string;
  suggestions?: string[];
  navAction?: Page;
}

function getBotResponse(
  input: string,
  conversationHistory: Message[],
): BotResult {
  const text = input.toLowerCase();
  const topic = detectTopic(text);

  // Nearby places
  if (detectNearbyQuery(text)) {
    return getNearbyResponse(text);
  }

  // Greetings
  if (/^(hi|hello|hey|namaste|good morning|good evening|hola)/.test(text)) {
    return {
      text: "👋 Hello! I'm your Alappuzha AI Travel Guide. I can help you with:\n• Places to explore\n• Food & dining\n• Houseboat booking\n• Itinerary planning\n• Budget tips\n• Transport & staying\n\nWhat would you like to know?",
      suggestions: [
        "Plan my trip",
        "Top places",
        "Nearby attractions",
        "Trip cost estimator",
      ],
    };
  }

  // Thank you
  if (/thank|thanks|great|awesome|helpful|perfect/.test(text)) {
    return {
      text: "You're welcome! 😊 Is there anything else about Alappuzha I can help you with?",
      suggestions: [
        "Nearby attractions",
        "Trip cost estimator",
        "Budget Calculator",
        "Plan itinerary",
      ],
    };
  }

  // 1-day itinerary
  if (/1.?day|one.?day/.test(text) && /itinerary|plan|trip/.test(text)) {
    return {
      text: "🗓️ **1-Day Alappuzha Itinerary:**\n\n🌅 **Morning (8–11am)**\n• Alappuzha Beach & old lighthouse pier\n• Breakfast: Appam + coconut stew at a local café\n\n☀️ **Afternoon (12–4pm)**\n• 2-hour backwater shikara boat ride\n• Visit Pathiramanal Island\n• Lunch: Karimeen Pollichathu\n\n🌇 **Evening (5–8pm)**\n• Punnamada Lake sunset\n• Arthunkal Church visit\n• Dinner at a riverside restaurant\n\nWant me to generate a full itinerary in the Itinerary Planner?",
      suggestions: [
        "Open Itinerary Planner",
        "3-day plan",
        "5-day plan",
        "Where to stay?",
      ],
      navAction: "itinerary" as Page,
    };
  }

  // 3-day itinerary
  if (/3.?day|three.?day/.test(text) && /itinerary|plan|trip/.test(text)) {
    return {
      text: "🗓️ **3-Day Alappuzha Itinerary:**\n\n📅 **Day 1 – Backwaters & Beach**\nMorning: Alappuzha Beach → Afternoon: Backwater cruise → Evening: Punnamada Lake sunset\n\n📅 **Day 2 – Culture & Islands**\nMorning: Arthunkal Church → Afternoon: Pathiramanal Island birding → Evening: Coir Museum\n\n📅 **Day 3 – Houseboat Experience**\nFull-day overnight houseboat with meals included on Vembanad Lake\n\nShall I open the Itinerary Generator for a personalised plan?",
      suggestions: [
        "Open Itinerary Planner",
        "Houseboat booking",
        "Where to stay?",
        "Budget for 3 days",
      ],
      navAction: "itinerary" as Page,
    };
  }

  // 5-day itinerary
  if (/5.?day|five.?day/.test(text) && /itinerary|plan|trip/.test(text)) {
    return {
      text: "🗓️ **5-Day Alappuzha Itinerary:**\n\n📅 Day 1: Arrival + Beach + local dinner\n📅 Day 2: Backwater shikara + Pathiramanal Island\n📅 Day 3: Overnight houseboat on Vembanad Lake\n📅 Day 4: Arthunkal Church + Marari Beach\n📅 Day 5: Coir Museum + shopping + departure\n\nUse the Itinerary Generator for a personalised plan based on your interests!",
      suggestions: [
        "Open Itinerary Planner",
        "Book stay",
        "Budget estimate",
        "Transport tips",
      ],
      navAction: "itinerary" as Page,
    };
  }

  // Generic itinerary / plan trip
  if (/itinerary|plan.?my.?trip|schedule|tour.?plan/.test(text)) {
    return {
      text: "📅 **Itinerary Generator**\nI can help plan your trip! Our Itinerary Generator creates day-by-day schedules based on:\n• Trip duration (1–7 days)\n• Your interests (backwaters, culture, food, nature)\n• Travel pace (relaxed, moderate, packed)\n\nOr tell me how many days you're staying and I'll give you a quick overview right here!",
      suggestions: [
        "1-day plan",
        "3-day plan",
        "5-day plan",
        "Open Itinerary Planner",
      ],
      navAction: "itinerary" as Page,
    };
  }

  // Restaurants / where to eat
  if (
    /restaurant|where.?eat|dining|best.?food.?place|seafood.?spot|café/.test(
      text,
    )
  ) {
    return {
      text: "🍽️ **Top Restaurants in Alappuzha:**\n\n1. **Thaff Restaurant** – Famous for Karimeen & Kerala meals\n2. **Harbour Restaurant** – Riverside views, fresh seafood\n3. **Mushroom Garden** – Budget-friendly veg & non-veg\n4. **Zam Zam Hotel** – Popular for biryani & Kerala beef fry\n5. **Chakara Restaurant** – Authentic Kerala thali\n\nYou can also book a table directly through the Restaurants page!",
      suggestions: [
        "Book a table",
        "Vegetarian options",
        "Street food",
        "Local food to try",
      ],
      navAction: "restaurants" as Page,
    };
  }

  // Vegetarian food
  if (/vegetarian|veg |vegan|no.?meat/.test(text)) {
    return {
      text: "🥗 **Vegetarian Options in Alappuzha:**\n• Kerala Sadhya (feast on banana leaf)\n• Appam with vegetable stew\n• Puttu & kadala curry (chickpea)\n• Avial (mixed vegetables in coconut)\n• Payasam (sweet kheer dessert)\n\nMost Kerala restaurants offer full vegetarian menus – just ask for the 'meals' option!",
      suggestions: [
        "Book a restaurant",
        "Street food",
        "Kerala Sadhya",
        "Budget for food",
      ],
    };
  }

  // Street food
  if (/street.?food|snack|quick.?bite|cheap.?food/.test(text)) {
    return {
      text: "🛺 **Street Food in Alappuzha:**\n• Banana chips (freshly fried) – ₹30–50/pack\n• Kadala curry with puttu – ₹40–60\n• Fish cutlets at beach stalls – ₹20–30 each\n• Fresh coconut water – ₹30–40\n• Pazham pori (banana fritter) – ₹10–15 each\n\nBest spot: Near Alappuzha Beach and the old market area!",
      suggestions: [
        "Top restaurants",
        "Local cuisine",
        "Budget for food",
        "Best places",
      ],
    };
  }

  // Book restaurant
  if (/book.?table|reserve.?table|book.?restaurant/.test(text)) {
    return {
      text: "🍽️ You can book a table at top Alappuzha restaurants directly through our app. I'll take you to the Restaurants page now!",
      suggestions: ["Show me restaurants", "What food to try", "Budget tips"],
      navAction: "restaurants" as Page,
    };
  }

  // Book stay
  if (
    /book.?stay|book.?hotel|book.?room|reserve.?room|accommodation.?booking/.test(
      text,
    )
  ) {
    return {
      text: "🏨 You can browse and book accommodations on our Stay page — from budget homestays to luxury resorts and houseboats. Shall I take you there?",
      suggestions: ["View stays", "Houseboat tips", "Budget for stay"],
      navAction: "stay" as Page,
    };
  }

  // Places to visit
  if (/places|visit|top|must.?see|attraction|destination|explore/.test(text)) {
    return {
      text: "🗺️ **Top Places in Alappuzha:**\n\n1. **Alappuzha Backwaters** – Iconic canal network & houseboat hub\n2. **Alappuzha Beach** – 137-year-old historic pier\n3. **Punnamada Lake** – Nehru Trophy Boat Race venue\n4. **Pathiramanal Island** – Rare migratory birds sanctuary\n5. **Arthunkal Church** – 450-year-old Portuguese basilica\n6. **Marari Beach** – Pristine, quieter than main beach\n7. **Ambalapuzha Temple** – Famous Palpayasam prasad\n8. **Kuttanad (Rice Bowl)** – Paddy fields below sea level\n\nExplore all 14 destinations on the Places page!",
      suggestions: [
        "Tell me about backwaters",
        "Hidden gems",
        "Plan itinerary",
        "Best beaches",
      ],
      navAction: "places" as Page,
    };
  }

  // Backwaters specific
  if (/backwater|canal|vembanad/.test(text)) {
    return {
      text: "🌊 **Alappuzha Backwaters:**\nThe backwaters are a network of lagoons, lakes, rivers and canals. Key highlights:\n\n• **Vembanad Lake** – Kerala's largest lake, great for houseboat cruises\n• **Kuttanad** – Farmlands 2m below sea level, unique in Asia\n• **Shikara rides** – 1–2 hour rides from ₹500–1,500\n• **Village canals** – Motor canoe tours through paddy fields\n• **Sunset cruises** – Most popular 5–7pm slot\n\nBest entry points: Finishing Point & Punnamada Jetty",
      suggestions: [
        "Houseboat booking",
        "Shikara rides",
        "Kuttanad tour",
        "Sunset cruise",
      ],
    };
  }

  // Beaches
  if (/beach|sea|coast|shore/.test(text)) {
    return {
      text: "🏖️ **Beaches near Alappuzha:**\n\n1. **Alappuzha Beach** – Most popular, has 137-yr-old pier & lighthouse\n2. **Marari Beach** – 15 km away, cleaner & less crowded\n3. **Andhakaranazhi Beach** – Secluded, great for solitude\n\nBest time: 5:30–7:30pm for the stunning sunsets!\nActivities: Volleyball, horse riding (Alappuzha Beach), kayaking (Marari)",
      suggestions: [
        "Places near Alappuzha Beach",
        "Best places",
        "Plan my day",
        "Getting around",
      ],
    };
  }

  // Best time
  if (/time|when|season|month|weather|monsoon|climate/.test(text)) {
    return {
      text: "🌤️ **Best Time to Visit Alappuzha:**\n\n✅ **Oct – Feb (Peak season)** – Cool & dry, ideal for everything\n✅ **Mar – May** – Warm but manageable, less crowds\n⚠️ **Jun – Aug** – Monsoon, lush green, but heavy rain & flooding\n\n🏆 **Special Events:**\n• Nehru Trophy Boat Race: 2nd Saturday, August\n• Champakulam Boat Race: June/July\n• Onam: Aug/Sep (grand celebrations)\n• Beach Festival: December\n\n💡 Pro tip: Book 3–4 months ahead for August boat race season!",
      suggestions: [
        "Nehru Trophy details",
        "Onam celebration",
        "Best places",
        "Plan my trip",
      ],
    };
  }

  // Food
  if (/food|eat|cuisine|fish|meal/.test(text)) {
    return {
      text: "🍛 **Must-Try Food in Alappuzha:**\n\n🐟 **Seafood Specialties:**\n• Karimeen Pollichathu – Pearl spot fish in banana leaf\n• Prawn curry with Kerala spices\n• Crab roast (dry masala)\n\n🌾 **Kerala Classics:**\n• Appam with coconut stew\n• Kappa & Meen Curry (tapioca + fish)\n• Kerala Sadhya (banana leaf feast)\n• Puttu & kadala curry\n\n🥤 **Drinks:**\n• Fresh toddy (palm wine) at toddy shops\n• Tender coconut water\n• Nannari sherbet (cooling summer drink)",
      suggestions: [
        "Best restaurants",
        "Street food",
        "Vegetarian options",
        "Book a table",
      ],
    };
  }

  // Houseboat
  if (/houseboat|kettuvallam|boat.?stay|floating/.test(text)) {
    return {
      text: "🚢 **Houseboat Guide:**\n\n💰 **Pricing:**\n• Day cruise (8am–6pm): ₹5,000–12,000\n• Overnight (1 cabin): ₹8,000–15,000\n• Luxury (2+ cabins): ₹15,000–25,000+\n\n✅ **What's Included:**\n• All meals (breakfast, lunch, dinner)\n• AC cabin with attached bathroom\n• Crew (captain + cook)\n• Welcome drinks\n\n📍 **Booking Tips:**\n• Book at least 2 weeks ahead (1–2 months for peak season)\n• Choose KTDC or Kerala Tourism-certified operators\n• Punnamada Jetty & Finishing Point are main departure points\n\nView our Stay page to book!",
      suggestions: [
        "Book a houseboat",
        "Day cruise vs overnight",
        "Best season",
        "What to pack",
      ],
      navAction: "stay" as Page,
    };
  }

  // What to pack
  if (/pack|bring|carry|luggage|clothes|wear/.test(text)) {
    return {
      text: "🎒 **What to Pack for Alappuzha:**\n\n👕 **Clothing:**\n• Light cotton clothes (it's humid!)\n• Modest dress for temple & church visits\n• Comfortable sandals / flip-flops\n• Light rain jacket (Oct–May)\n\n🧴 **Essentials:**\n• Sunscreen SPF 50+ (strong sun on water)\n• Mosquito repellent (especially for backwaters)\n• Rehydration salts\n• Cash (many local spots are cash-only)\n\n📱 **Handy Apps:**\n• Google Maps offline (download Alappuzha)\n• UPI payments accepted widely",
      suggestions: [
        "Best time to visit",
        "Getting around",
        "Budget tips",
        "Places to visit",
      ],
    };
  }

  // Transport
  if (
    /transport|taxi|auto|bus|train|travel|reach|getting|how.?to.?get|ferry|boat.?ride/.test(
      text,
    )
  ) {
    return {
      text: "🚌 **Getting To & Around Alappuzha:**\n\n✈️ **From Kochi Airport (85 km):**\n• Taxi: ₹1,200–1,500 (~1.5 hrs)\n• KSRTC bus: ₹60–80 (~2 hrs)\n• Train: Change at Ernakulam, then direct (₹50–80)\n\n🏙️ **Local Transport:**\n• Auto-rickshaw: ₹15 base + ₹12/km (metered)\n• Cycle rickshaw: ₹50–100 for short rides\n• Rental bicycle: ₹100–150/day (eco-friendly!)\n• Ferry/water transport: ₹5–20 for canal crossings\n\nBook local transport through our Transport page!",
      suggestions: [
        "Book transport",
        "Backwater ferry",
        "Bicycle rental",
        "Getting to Kochi",
      ],
      navAction: "transport" as Page,
    };
  }

  // Festivals
  if (
    /festival|event|boat race|nehru|onam|celebration|champakulam/.test(text)
  ) {
    return {
      text: "🎉 **Festivals & Events in Alappuzha:**\n\n🚣 **Boat Races:**\n• Nehru Trophy Boat Race – 2nd Sat, August (most famous)\n• Champakulam Moolam Boat Race – June/July (oldest)\n• Payippad Boat Race – August\n\n🪔 **Cultural Festivals:**\n• Onam Harvest Festival – Aug/Sep (10-day grand celebration)\n• Arthunkal Perunnal – January feast at St. Andrew's Church\n• Alappuzha Beach Festival – December\n• Mannarasala Snake Temple Festival – August/September\n\n💡 Book accommodation 3–4 months in advance for Nehru Trophy!",
      suggestions: [
        "Nehru Trophy tickets",
        "Onam events",
        "Best time to visit",
        "Book stay",
      ],
    };
  }

  // Budget
  if (/budget|cost|price|cheap|expensive|money|spend|how.?much/.test(text)) {
    return {
      text: "💰 **Alappuzha Budget Guide:**\n\n🪙 **Budget Traveller (₹1,500–2,500/day):**\n• Homestay: ₹600–1,000/night\n• Street food meals: ₹100–200/meal\n• Auto-rickshaw & ferry transport\n• Free/low-cost beach & temple visits\n\n🏨 **Mid-Range (₹3,500–6,000/day):**\n• Hotel/resort: ₹2,500–4,000/night\n• Restaurant meals: ₹300–500/meal\n• Day houseboat cruise\n\n✨ **Luxury (₹8,000+/day):**\n• Luxury resort: ₹5,000–12,000/night\n• Overnight houseboat with all meals\n• Private boat tours & spa\n\nUse our Budget Calculator for a precise trip estimate!",
      suggestions: [
        "Open Budget Calculator",
        "Trip cost estimator",
        "Budget food",
        "Save on houseboats",
      ],
      navAction: "budget" as Page,
    };
  }

  // Stay / accommodation
  if (/stay|hotel|resort|homestay|accommodation|room|sleep|lodge/.test(text)) {
    return {
      text: "🏡 **Accommodation in Alappuzha:**\n\n🛖 **Types Available:**\n• Backwater homestays: from ₹800/night (local family experience)\n• Budget hotels: ₹1,200–2,000/night\n• Mid-range resorts: ₹2,500–4,500/night\n• Heritage hotels: ₹4,000–7,000/night\n• Luxury resorts: ₹7,000–15,000/night\n• Houseboat overnight: ₹8,000–25,000\n• Floating cottages: ₹5,000–10,000/night\n\nBrowse all 10 accommodation options on our Stay page!",
      suggestions: [
        "Book a stay",
        "Houseboat guide",
        "Budget stays",
        "Luxury options",
      ],
      navAction: "stay" as Page,
    };
  }

  // Hidden gems
  if (/hidden|offbeat|lesser.?known|secret|unknown/.test(text)) {
    return {
      text: "💎 **Hidden Gems of Alappuzha:**\n\n1. **Andhakaranazhi Beach** – Completely secluded, no crowds\n2. **Karumadi Village** – Ancient Buddhist ruins & paddy fields\n3. **Nedumudi** – Tiny island, local life & canal network\n4. **Kumarakom Bird Sanctuary** (nearby) – Best for birding\n5. **Thottappally** – Where the backwaters meet the sea!\n6. **Kalloorkad Church** – 1,000-year-old historic church in village\n\nThese spots are best reached by auto-rickshaw or rented bicycle!",
      suggestions: [
        "How to get there",
        "Rent a bicycle",
        "More places",
        "Plan my trip",
      ],
    };
  }

  // Safety tips
  if (/safe|safety|danger|scam|careful|precaution/.test(text)) {
    return {
      text: "🛡️ **Safety Tips for Alappuzha:**\n\n✅ **General Safety:**\n• Alappuzha is generally very safe for tourists\n• Solo female travel is considered safe here\n• Avoid swimming in backwaters (strong currents)\n\n⚠️ **Watch Out For:**\n• Unlicensed houseboat operators (choose KTDC-certified)\n• Monsoon flooding (Jun–Aug) near low-lying areas\n• Auto-rickshaw overcharging – insist on meter\n\n🩺 **Health Tips:**\n• Carry mosquito repellent (dengue season: Jul–Oct)\n• Drink bottled/filtered water\n• Sunscreen is essential on the water",
      suggestions: [
        "Houseboat safety",
        "Best time to visit",
        "What to pack",
        "Getting around",
      ],
    };
  }

  // Open specific pages
  if (
    /open.?itinerary|itinerary.?planner|go.?to.?itinerary|show.?itinerary/.test(
      text,
    )
  ) {
    return {
      text: "📅 Opening the Itinerary Generator for you!",
      suggestions: ["1-day plan", "3-day plan", "5-day plan"],
      navAction: "itinerary" as Page,
    };
  }

  if (/open.?budget|budget.?calculator|go.?to.?budget/.test(text)) {
    return {
      text: "🧮 Opening the Budget Calculator!",
      suggestions: ["Budget guide", "Cheap options", "Luxury trip cost"],
      navAction: "budget" as Page,
    };
  }

  if (
    /open.?stay|go.?to.?stay|view.?stay|show.?stay|book.?accommodation/.test(
      text,
    )
  ) {
    return {
      text: "🏡 Taking you to our Stay page!",
      suggestions: ["Houseboat guide", "Budget stays", "Luxury resorts"],
      navAction: "stay" as Page,
    };
  }

  if (
    /open.?transport|go.?to.?transport|book.?transport|view.?transport/.test(
      text,
    )
  ) {
    return {
      text: "🚌 Opening the Transport page for you!",
      suggestions: ["Auto-rickshaw", "Ferry rides", "Taxi tips"],
      navAction: "transport" as Page,
    };
  }

  if (
    /open.?restaurant|go.?to.?restaurant|view.?restaurant|book.?restaurant/.test(
      text,
    )
  ) {
    return {
      text: "🍽️ Taking you to the Restaurants page!",
      suggestions: ["Local cuisine", "Vegetarian options", "Street food"],
      navAction: "restaurants" as Page,
    };
  }

  // Budget Calculator navigation
  if (/budget.?calculator|calculate.*budget|trip.*cost/.test(text)) {
    return {
      text: "🧮 Opening the Budget Calculator to help you plan your trip expenses!",
      navAction: "budget" as Page,
      suggestions: ["Budget guide", "Cheap stays", "Budget food"],
    };
  }

  // Context-aware follow-up: detect "more" or "tell me more"
  if (/more|detail|elaborate|explain|tell me more|what else/.test(text)) {
    const lastBotMsg = [...conversationHistory]
      .reverse()
      .find((m) => m.role === "bot");
    if (lastBotMsg) {
      const lastTopic = detectTopic(lastBotMsg.text);
      if (lastTopic && TOPIC_FOLLOWUPS[lastTopic]) {
        return {
          text: "Here are some related things you might find helpful:",
          suggestions: TOPIC_FOLLOWUPS[lastTopic],
        };
      }
    }
  }

  // Default with topic-aware suggestions
  const followUps = topic
    ? TOPIC_FOLLOWUPS[topic]
    : [
        "Top places",
        "Nearby attractions",
        "Trip cost estimator",
        "Houseboat tips",
      ];
  return {
    text: '🌴 I can help with that! Here are some things I know about Alappuzha:\n• Backwaters & houseboat cruises\n• Top tourist destinations\n• Local food & restaurants\n• Festivals & events\n• Budget planning\n• Transport & getting around\n• Accommodation & stays\n\nTry asking something like: "Places near the beach" or "Estimate my trip cost" 😊',
    suggestions: followUps,
  };
}

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

function EstimatorCard({ result }: { result: EstimatorResult }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden text-sm mt-1">
      <div className="bg-primary/10 px-3.5 py-2.5 flex items-center gap-2">
        <Calculator className="w-4 h-4 text-primary" />
        <span className="font-semibold text-foreground">
          Trip Estimate · {result.days} day{result.days > 1 ? "s" : ""}
        </span>
      </div>
      <div className="px-3.5 py-2.5 space-y-1.5">
        <div className="flex justify-between">
          <span className="text-muted-foreground">🏡 Accommodation</span>
          <span className="font-medium">₹{fmt(result.accCost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">🚌 Transport</span>
          <span className="font-medium">₹{fmt(result.transportCost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">🍛 Food</span>
          <span className="font-medium">₹{fmt(result.foodCost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">🎯 Activities</span>
          <span className="font-medium">₹{fmt(result.actCost)}</span>
        </div>
        <div className="border-t border-border pt-1.5 mt-1 flex justify-between">
          <span className="font-semibold text-foreground">💰 Total</span>
          <span className="font-bold text-primary">
            ₹{fmt(result.total)} – ₹{fmt(result.totalMax)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ChatbotWidget({ navigate }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "👋 Welcome! I'm your **Alappuzha AI Travel Guide**. I can help you plan your trip, discover local food, book stays, and more!\n\nWhat would you like to explore?",
      suggestions: INITIAL_QUICK_REPLIES,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [estimator, setEstimator] = useState<EstimatorState>({
    active: false,
    step: null,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCount = messages.length;

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally using messageCount and isTyping to trigger scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCount, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const pushBotMessage = (msg: Omit<Message, "id" | "role">) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: `bot-${Date.now()}-${Math.random()}`, role: "bot" },
    ]);
  };

  const advanceEstimator = (choice: string) => {
    const current = estimator.step;
    const currentIdx = STEP_ORDER.indexOf(current);
    const nextStep = STEP_ORDER[currentIdx + 1] ?? "result";

    // Update state with the choice
    const next: EstimatorState = { ...estimator };
    if (current === "days") next.days = Number.parseInt(choice, 10);
    else if (current === "accommodation") next.accommodation = choice;
    else if (current === "transport") next.transport = choice;
    else if (current === "food") next.food = choice;
    else if (current === "activities") next.activities = choice;

    if (nextStep === "result") {
      next.active = false;
      next.step = null;
      const result = computeEstimate(next);
      setEstimator(next);
      setIsTyping(false);
      pushBotMessage({
        text: `Here's your personalised trip estimate! 🎉`,
        estimatorResult: result,
        suggestions: [
          "Open Budget Calculator",
          "Plan my itinerary",
          "Book a stay",
          "Start over",
        ],
      });
    } else {
      next.step = nextStep;
      setEstimator(next);
      const stepInfo = ESTIMATOR_STEPS[nextStep as NonNullable<EstimatorStep>];
      setIsTyping(false);
      pushBotMessage({
        text: stepInfo.question,
        suggestions: stepInfo.chips,
      });
    }
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;

    // Reset estimator if user types something non-chip
    if (estimator.active) {
      const currentChips =
        ESTIMATOR_STEPS[estimator.step as NonNullable<EstimatorStep>]?.chips ??
        [];
      const isValidChip = currentChips.includes(text.trim());
      if (!isValidChip) {
        // Cancel estimator, treat as normal message
        setEstimator({ active: false, step: null });
      } else {
        // Advance estimator
        const userMsg: Message = {
          id: `user-${Date.now()}`,
          role: "user",
          text: text.trim(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);
        setTimeout(() => advanceEstimator(text.trim()), 400);
        return;
      }
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Check if user wants to start estimator
    if (
      detectEstimatorTrigger(text.toLowerCase()) ||
      text.toLowerCase() === "trip cost estimator" ||
      text.toLowerCase() === "start over"
    ) {
      const newEst: EstimatorState = { active: true, step: "days" };
      setEstimator(newEst);
      setTimeout(() => {
        setIsTyping(false);
        pushBotMessage({
          text: `🧮 **Trip Cost Estimator**\nLet me help you estimate your trip costs! I'll ask you a few quick questions.\n\n${ESTIMATOR_STEPS.days.question}`,
          suggestions: ESTIMATOR_STEPS.days.chips,
        });
      }, 500);
      return;
    }

    const delay = 500 + Math.random() * 400;
    setTimeout(() => {
      const result = getBotResponse(text, messages);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: result.text,
        suggestions: result.suggestions,
        navAction: result.navAction,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      if (result.navAction) {
        setTimeout(() => navigate(result.navAction!), 1500);
      }
    }, delay);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const renderText = (text: string) => {
    return text.split("\n").map((line, i) => {
      const key = `line-${i}-${line.slice(0, 8)}`;
      const boldFormatted = line.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>",
      );
      return (
        <span key={key}>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: safe formatted text */}
          <span dangerouslySetInnerHTML={{ __html: boldFormatted }} />
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            data-ocid="chatbot.open_modal_button"
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Open travel guide chat"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[390px] max-w-[calc(100vw-1.5rem)] flex flex-col rounded-2xl shadow-2xl border border-border overflow-hidden bg-card"
            style={{ maxHeight: "calc(100vh - 5rem)", height: "600px" }}
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3.5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm leading-tight">
                    Alappuzha AI Guide
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs opacity-70">
                      Smart Travel Assistant
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  data-ocid="chatbot.secondary_button"
                  type="button"
                  onClick={() => {
                    setEstimator({ active: false, step: null });
                    sendMessage("trip cost estimator");
                  }}
                  className="w-8 h-8 rounded-full hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                  aria-label="Open trip cost estimator"
                  title="Trip cost estimator"
                >
                  <Calculator className="w-4 h-4" />
                </button>
                <button
                  data-ocid="chatbot.toggle"
                  type="button"
                  onClick={() => sendMessage("Nearby attractions")}
                  className="w-8 h-8 rounded-full hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                  aria-label="Ask about nearby places"
                  title="Nearby places"
                >
                  <MapPin className="w-4 h-4" />
                </button>
                <button
                  data-ocid="chatbot.close_button"
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Estimator step pill */}
            <AnimatePresence>
              {estimator.active && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-primary/8 border-b border-primary/15 px-4 py-2 flex items-center justify-between flex-shrink-0"
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      Cost Estimator — Step{" "}
                      {STEP_ORDER.indexOf(estimator.step) + 1} of{" "}
                      {STEP_ORDER.length - 1}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEstimator({ active: false, step: null });
                      pushBotMessage({
                        text: "Estimator cancelled. What else can I help you with?",
                        suggestions: INITIAL_QUICK_REPLIES.slice(0, 4),
                      });
                    }}
                    className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "bot" && (
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted text-foreground rounded-tl-sm"
                      }`}
                    >
                      {renderText(msg.text)}
                      {msg.estimatorResult && (
                        <EstimatorCard result={msg.estimatorResult} />
                      )}
                    </div>
                  </motion.div>

                  {/* Inline suggestions after bot messages */}
                  {msg.role === "bot" &&
                    msg.suggestions &&
                    msg.suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.2 }}
                        className="flex flex-wrap gap-1.5 mt-2 ml-9"
                      >
                        {msg.suggestions.map((s, idx) => (
                          <button
                            key={`${msg.id}-s${idx}`}
                            data-ocid={`chatbot.suggestion.${idx + 1}`}
                            type="button"
                            onClick={() => sendMessage(s)}
                            disabled={isTyping}
                            className="text-xs px-2.5 py-1 rounded-full border border-primary/25 text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-primary/5 font-medium"
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                </div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 flex-shrink-0">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  data-ocid="chatbot.input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    estimator.active
                      ? "Select an option above or type to cancel…"
                      : "Ask about places, costs, nearby…"
                  }
                  disabled={isTyping}
                  className="flex-1 text-sm rounded-xl border-primary/20 focus:border-primary"
                />
                <Button
                  data-ocid="chatbot.submit_button"
                  type="submit"
                  size="icon"
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-primary hover:bg-primary/90 rounded-xl w-9 h-9 flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground text-center mt-2 opacity-60">
                AI-powered travel guide for Alappuzha
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
